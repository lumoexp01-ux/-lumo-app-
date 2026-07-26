// functions/index.js — LUMO Cloud Functions
// Fragmento 7.0 — Segurança de acesso
// Corrigido: Timestamp nativo, set+merge, base64url no deviceId

'use strict';

const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule }         = require('firebase-functions/v2/scheduler');
const { onDocumentUpdated }  = require('firebase-functions/v2/firestore');
const { setGlobalOptions }   = require('firebase-functions/v2');
const { defineSecret }       = require('firebase-functions/params');
const admin = require('firebase-admin');

const RC_SECRET_KEY           = defineSecret('RC_SECRET_KEY');
const WEBHOOK_SECRET          = defineSecret('WEBHOOK_SECRET');
const DISCORD_BOT_TOKEN       = defineSecret('DISCORD_BOT_TOKEN');
const DISCORD_GUILD_ID        = defineSecret('DISCORD_GUILD_ID');
const DISCORD_ROLE_TRIAL_ID   = defineSecret('DISCORD_ROLE_TRIAL_ID');
const DISCORD_ROLE_EXPIRED_ID = defineSecret('DISCORD_ROLE_EXPIRED_ID');
const DISCORD_ROLE_PRO_ID     = defineSecret('DISCORD_ROLE_PRO_ID');
const STRIPE_SECRET_KEY       = defineSecret('STRIPE_SECRET_KEY');
const STRIPE_WEBHOOK_PIX      = defineSecret('STRIPE_WEBHOOK_PIX');

admin.initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

// ─────────────────────────────────────────────────────────────────────────────
// Helpers Discord (internos — nunca exportados)
//
// Modelo de roles (um de cada vez por usuário):
//   @Trial   — trial ativo (lê + escreve em tudo igual ao Pro)
//   @Expirado — trial expirado ou assinatura cancelada (só leitura em COMUNIDADE PRO)
//   @Pro     — assinante ativo (lê + escreve em tudo)
//
// Toda chamada à API do Discord é não-fatal: falha de rede ou Discord fora do
// ar nunca bloqueia pagamento, trial ou webhook. Logs auditam cada transição.
// ─────────────────────────────────────────────────────────────────────────────

// Remove BOM (U+FEFF) e espaços — todos os secrets podem vir com BOM ao copiar/colar
function s(secret) {
  return secret.value().replace(/^﻿/, '').trim();
}

function discordAtivo() {
  const token = s(DISCORD_BOT_TOKEN);
  const guild = s(DISCORD_GUILD_ID);
  return !!(token && token !== 'PLACEHOLDER' && guild && guild !== 'PLACEHOLDER');
}

// Retorna o Role ID do Discord para o tipo dado, ou null se ainda não configurado
function discordRoleId(tipo) {
  const mapa = {
    trial:   s(DISCORD_ROLE_TRIAL_ID),
    expired: s(DISCORD_ROLE_EXPIRED_ID),
    pro:     s(DISCORD_ROLE_PRO_ID),
  };
  const id = mapa[tipo];
  return (id && id !== 'PLACEHOLDER') ? id : null;
}

async function discordAPI(method, memberId, roleId) {
  const guildId = s(DISCORD_GUILD_ID);
  const url = `https://discord.com/api/v10/guilds/${guildId}/members/${memberId}/roles/${roleId}`;
  const res = await fetch(url, {
    method,
    headers: { 'Authorization': `Bot ${s(DISCORD_BOT_TOKEN)}` },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.warn(`[discord] API ${method} HTTP ${res.status}: ${body}`);
  }
  return res;
}

// Lê discordUserId e discordRoleAtual do Firestore (uma leitura só)
async function discordGetInfo(uid) {
  const snap = await admin.firestore().doc(`usuarios/${uid}`).get();
  if (!snap.exists) return { discordUserId: null, roleAtual: null };
  const data = snap.data();
  return {
    discordUserId: data.discordUserId ?? null,
    roleAtual:     data.discordRoleAtual ?? null,
  };
}

// Transição genérica: remove role anterior (se houver), adiciona novo role.
// Garante que nunca há mais de uma role (Trial/Expirado/Pro) ao mesmo tempo.
async function discordTransicionar(uid, novoTipo, motivo) {
  if (!discordAtivo()) return;
  try {
    const { discordUserId, roleAtual } = await discordGetInfo(uid);

    if (!discordUserId) {
      console.log(`[discord] ${motivo}: sem discordUserId uid=${uid} — aguardando vínculo`);
      return;
    }

    // Remove role anterior (só se diferente do novo — evita toggle desnecessário)
    if (roleAtual && roleAtual !== novoTipo) {
      const idAnterior = discordRoleId(roleAtual);
      if (idAnterior) {
        const r = await discordAPI('DELETE', discordUserId, idAnterior);
        console.log(`[discord] -${roleAtual} uid=${uid} (${motivo}): HTTP ${r.status}`);
      }
    }

    // Adiciona novo role
    const idNovo = discordRoleId(novoTipo);
    if (idNovo) {
      const r = await discordAPI('PUT', discordUserId, idNovo);
      console.log(`[discord] +${novoTipo} uid=${uid} (${motivo}): HTTP ${r.status}`);
    }

    await admin.firestore().doc(`usuarios/${uid}`).set(
      { discordRoleAtual: novoTipo },
      { merge: true }
    );
  } catch (err) {
    console.warn(`[discord] Erro ${motivo} (não fatal):`, err.message);
  }
}

// Secrets Discord — usados em todas as CFs que chamam discordTransicionar
const DISCORD_SECRETS = [
  DISCORD_BOT_TOKEN,
  DISCORD_GUILD_ID,
  DISCORD_ROLE_TRIAL_ID,
  DISCORD_ROLE_EXPIRED_ID,
  DISCORD_ROLE_PRO_ID,
];

// ─────────────────────────────────────────────────────────────────────────────
// verificarAcesso — guard de acesso no servidor
//
// Lê `pagamento` direto do Firestore via Admin SDK.
// trialFim é Timestamp nativo — usa .toMillis() para comparar.
// Trial e Pro recebem discordLink (acesso idêntico ao Discord durante o período).
// ─────────────────────────────────────────────────────────────────────────────
exports.verificarAcesso = onCall({
  cors: ['https://lumoexp01-ux.github.io', 'http://localhost:3000'],
  invoker: 'public',
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Login necessário.');
  }

  const uid = request.auth.uid;

  try {
    const snap = await admin.firestore().doc(`usuarios/${uid}`).get();

    if (!snap.exists) {
      return { acesso: false, motivo: 'usuario-nao-encontrado' };
    }

    const pagamento = snap.data().pagamento ?? {};
    const agora     = Date.now();

    async function buscarDiscordLink() {
      try {
        const cfg = await admin.firestore().doc('config-app/global').get();
        return cfg.exists ? (cfg.data()?.discordLink ?? null) : null;
      } catch (_) { return null; }
    }

    // Verificar trial ativo
    if (pagamento.trial === true && pagamento.trialFim) {
      const trialFimMs = typeof pagamento.trialFim.toMillis === 'function'
        ? pagamento.trialFim.toMillis()
        : new Date(pagamento.trialFim).getTime();

      if (!isNaN(trialFimMs) && agora < trialFimMs) {
        const trialFimISO = typeof pagamento.trialFim.toDate === 'function'
          ? pagamento.trialFim.toDate().toISOString()
          : pagamento.trialFim;
        const discordLink = await buscarDiscordLink();
        return { acesso: true, tipo: 'trial', trialFim: trialFimISO, discordLink };
      }
    }

    // Verificar assinatura paga
    if (pagamento.pago === true) {
      const discordLink = await buscarDiscordLink();
      return { acesso: true, tipo: 'pago', plano: pagamento.plano ?? null, discordLink };
    }

    const trialVirgem = (pagamento.trialUsado !== true);
    return { acesso: false, motivo: 'sem-assinatura', trialVirgem };

  } catch (_) {
    throw new HttpsError('internal', 'Erro ao verificar acesso.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ativarTrial — ativa trial de 7 dias de forma segura no servidor
// ─────────────────────────────────────────────────────────────────────────────
exports.ativarTrial = onCall({
  cors: ['https://lumoexp01-ux.github.io', 'http://localhost:3000'],
  invoker: 'public',
  secrets: DISCORD_SECRETS,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Login necessário.');
  }

  const uid         = request.auth.uid;
  const email       = (request.auth.token.email ?? '').toLowerCase().trim();
  const rawDeviceId = String(request.data?.deviceId ?? '').slice(0, 128);
  const deviceKey   = rawDeviceId
    ? Buffer.from(rawDeviceId).toString('base64url')
    : '';

  try {
    const db = admin.firestore();

    const userSnap = await db.doc(`usuarios/${uid}`).get();
    if (userSnap.exists && userSnap.data().pagamento?.trialUsado === true) {
      return { sucesso: false, motivo: 'trial-ja-usado' };
    }

    if (email) {
      const emailKey  = Buffer.from(email).toString('base64url');
      const emailSnap = await db.doc(`triaisUsados/email_${emailKey}`).get();
      if (emailSnap.exists) {
        return { sucesso: false, motivo: 'email-ja-usou-trial' };
      }
    }

    if (deviceKey) {
      const deviceSnap = await db.doc(`triaisUsados/device_${deviceKey}`).get();
      if (deviceSnap.exists) {
        return { sucesso: false, motivo: 'device-ja-usou-trial' };
      }
    }

    const agora             = new Date();
    const trialFim          = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
    const trialFimTimestamp = admin.firestore.Timestamp.fromDate(trialFim);

    const batch = db.batch();

    batch.set(db.doc(`usuarios/${uid}`), {
      pagamento: {
        trial:      true,
        trialUsado: true,
        trialFim:   trialFimTimestamp,
        pago:       false,
        plano:      null,
      },
      subscriptionStatus: 'trial',
      trialStartDate:     agora.toISOString(),
    }, { merge: true });

    if (email) {
      const emailKey = Buffer.from(email).toString('base64url');
      batch.set(db.doc(`triaisUsados/email_${emailKey}`), {
        ativadoEm: admin.firestore.Timestamp.fromDate(agora),
      });
    }

    if (deviceKey) {
      batch.set(db.doc(`triaisUsados/device_${deviceKey}`), {
        ativadoEm: admin.firestore.Timestamp.fromDate(agora),
      });
    }

    await batch.commit();

    // Atribuir @Trial no Discord (não bloqueia se usuário ainda não vinculou)
    await discordTransicionar(uid, 'trial', 'trial-inicio');

    console.log('Trial ativado:', uid);
    return { sucesso: true, trialFim: trialFim.toISOString() };

  } catch (err) {
    if (err.code) throw err;
    console.error('Erro em ativarTrial');
    throw new HttpsError('internal', 'Erro ao ativar trial.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ativarPagamento — chamado pelo cliente após purchasePackage() RC ser concluído
// ─────────────────────────────────────────────────────────────────────────────
exports.ativarPagamento = onCall({
  cors: ['https://lumoexp01-ux.github.io', 'http://localhost:3000'],
  invoker: 'public',
  secrets: [RC_SECRET_KEY, ...DISCORD_SECRETS],
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Login necessário.');
  }

  const uid           = request.auth.uid;
  const planoDesejado = request.data?.plano || 'desconhecido';

  try {
    const RC_V1_KEY    = RC_SECRET_KEY.value();
    const rcCustomerId = '_user_id=' + uid;
    console.log('[ativarPagamento] Consultando RC v1 para customer:', rcCustomerId);

    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${rcCustomerId}`,
      {
        headers: {
          'Authorization': `Bearer ${RC_V1_KEY}`,
          'Accept': 'application/json',
        },
      }
    );

    console.log('[ativarPagamento] RC status HTTP:', response.status);
    const rcData = await response.json();
    console.log('[ativarPagamento] RC entitlements:', JSON.stringify(rcData?.subscriber?.entitlements ?? {}));

    const entitlement = rcData?.subscriber?.entitlements?.['lumo_pro'];
    const expiracao   = entitlement?.expires_date;
    console.log('[ativarPagamento] entitlement lumo_pro:', entitlement ?? 'não encontrado');

    if (!expiracao || new Date(expiracao).getTime() < Date.now()) {
      console.warn('[ativarPagamento] Acesso negado. RC status:', response.status);
      throw new HttpsError('permission-denied', 'Pagamento não confirmado pelo provedor.');
    }

    const identifier = entitlement.product_identifier || planoDesejado;

    await admin.firestore().doc(`usuarios/${uid}`).set({
      pagamento: {
        pago:       true,
        trial:      false,
        trialUsado: true,
        plano:      identifier,
        pagoEm:     admin.firestore.Timestamp.fromDate(new Date()),
      },
      subscriptionStatus: 'pro',
    }, { merge: true });

    // Discord: remove @Trial ou @Expirado (o que estiver ativo) e atribui @Pro
    await discordTransicionar(uid, 'pro', 'pagamento-web');

    console.log('Pagamento ativado via RC:', uid, identifier);
    return { sucesso: true };
  } catch (err) {
    if (err.code) throw err;
    console.error('Erro ao verificar RC API:', err);
    throw new HttpsError('internal', 'Erro ao registrar pagamento.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// webhookRevenueCat — Atualiza status do assinante em caso de renovação/cancelamento
// ─────────────────────────────────────────────────────────────────────────────
exports.webhookRevenueCat = onRequest({
  secrets: [WEBHOOK_SECRET, ...DISCORD_SECRETS],
}, async (req, res) => {
  const auth = req.headers['authorization'] ?? '';
  if (auth !== WEBHOOK_SECRET.value()) {
    return res.status(401).send('Não autorizado');
  }

  try {
    const event = req.body?.event;
    if (!event) return res.status(400).send('Sem evento');

    // RC envia app_user_id com prefixo "_user_id=" quando a purchase URL usa esse formato
    const rawId = event.app_user_id ?? '';
    const uid   = rawId.startsWith('_user_id=') ? rawId.slice('_user_id='.length) : rawId;
    if (!uid) return res.status(400).send('Sem UID');

    const ref = admin.firestore().doc(`usuarios/${uid}`);

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
        await ref.set({
          pagamento: {
            pago: true,
            trial: false,
            proximoVencimento: event.expiration_at_ms
              ? new Date(event.expiration_at_ms).toISOString()
              : null,
          },
          subscriptionStatus: 'pro',
        }, { merge: true });
        console.log(`Webhook: Assinatura renovada/ativada para UID ${uid} (${event.type})`);
        // Remove @Trial ou @Expirado (o que estiver), adiciona @Pro
        await discordTransicionar(uid, 'pro', `webhook-${event.type.toLowerCase()}`);
        break;

      case 'CANCELLATION':
      case 'EXPIRATION':
        await ref.set({
          pagamento: {
            pago: false,
            canceladoEm: new Date().toISOString(),
          },
          subscriptionStatus: 'expired',
        }, { merge: true });
        console.log(`Webhook: Assinatura expirada/cancelada para UID ${uid} (${event.type})`);
        // Remove @Pro, adiciona @Expirado (leitura em COMUNIDADE PRO)
        await discordTransicionar(uid, 'expired', `webhook-${event.type.toLowerCase()}`);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Erro no webhook:', err);
    res.status(500).send('Erro interno');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// expirarTrialsDiscord — Cron diário (3h horário de Brasília)
//
// Percorre usuários com subscriptionStatus == 'trial' e, para os que têm
// trialStartDate >= 7 dias atrás sem conversão para pago:
//   Remove @Trial → adiciona @Expirado (leitura em COMUNIDADE PRO)
//   Atualiza subscriptionStatus para 'expired'
// ─────────────────────────────────────────────────────────────────────────────
exports.expirarTrialsDiscord = onSchedule({
  schedule: '0 3 * * *',
  timeZone: 'America/Sao_Paulo',
  region: 'us-central1',
  secrets: DISCORD_SECRETS,
}, async () => {
  const db           = admin.firestore();
  const agora        = Date.now();
  const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

  const snap = await db.collection('usuarios')
    .where('subscriptionStatus', '==', 'trial')
    .get();

  if (snap.empty) {
    console.log('[trial-expiry] Nenhum usuário com trial ativo.');
    return;
  }

  let expirados = 0;
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const uid  = docSnap.id;

    // Não expirar quem já converteu para pago
    if (data.pagamento?.pago === true) continue;

    // Calcular início do trial: campo direto ou fallback via trialFim − 7 dias
    const trialStartMs = data.trialStartDate
      ? new Date(data.trialStartDate).getTime()
      : typeof data.pagamento?.trialFim?.toMillis === 'function'
        ? data.pagamento.trialFim.toMillis() - SETE_DIAS_MS
        : null;

    if (!trialStartMs || isNaN(trialStartMs)) continue;
    if (agora - trialStartMs < SETE_DIAS_MS) continue;

    console.log(`[trial-expiry] Expirando trial uid=${uid} — transicionando para @Expirado`);

    // Remove @Trial, adiciona @Expirado (leitura em COMUNIDADE PRO)
    await discordTransicionar(uid, 'expired', 'trial-expirado');

    await docSnap.ref.set({ subscriptionStatus: 'expired' }, { merge: true });

    expirados++;
  }

  console.log(`[trial-expiry] ${expirados} trial(s) expirado(s) de ${snap.size} verificados.`);
});

// ─────────────────────────────────────────────────────────────────────────────
// onDiscordUserIdVinculado — Trigger Firestore
//
// Dispara quando discordUserId muda para um valor novo (usuário vincula conta
// Discord pela primeira vez, ou troca o ID). Atribui automaticamente o cargo
// correto com base no status de assinatura atual — cobre usuários que já eram
// Pro/Trial antes de vincular o Discord.
// ─────────────────────────────────────────────────────────────────────────────
exports.onDiscordUserIdVinculado = onDocumentUpdated({
  document: 'usuarios/{uid}',
  region: 'southamerica-east1',
  secrets: DISCORD_SECRETS,
}, async (event) => {
  const before = event.data.before.data() ?? {};
  const after  = event.data.after.data()  ?? {};
  const uid    = event.params.uid;

  const idAntes = before.discordUserId ?? null;
  const idAgora = after.discordUserId  ?? null;

  // Só processa quando o ID foi adicionado ou trocado
  if (!idAgora || idAntes === idAgora) return;

  const pagamento = after.pagamento ?? {};
  let novoTipo = null;

  if (pagamento.pago === true) {
    novoTipo = 'pro';
  } else if (pagamento.trial === true && pagamento.trialFim) {
    const trialFimMs = typeof pagamento.trialFim.toMillis === 'function'
      ? pagamento.trialFim.toMillis()
      : new Date(pagamento.trialFim).getTime();
    novoTipo = Date.now() < trialFimMs ? 'trial' : 'expired';
  } else if (after.subscriptionStatus === 'expired') {
    novoTipo = 'expired';
  }

  if (!novoTipo) {
    console.log(`[discord] id-vinculado uid=${uid}: sem assinatura ativa, nenhum cargo atribuído`);
    return;
  }

  console.log(`[discord] id-vinculado uid=${uid}: discordUserId="${idAgora}" → cargo ${novoTipo}`);
  await discordTransicionar(uid, novoTipo, 'discord-id-vinculado');
});

// ─────────────────────────────────────────────────────────────────────────────
// enviarPushHorarioCritico — Notificação FCM nos horários críticos do usuário
// ─────────────────────────────────────────────────────────────────────────────
exports.enviarPushHorarioCritico = onSchedule(
  { schedule: '0 * * * *', timeZone: 'America/Sao_Paulo', region: 'us-central1' },
  async () => {
    const horaN = parseInt(
      new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: 'numeric',
        hour12: false,
      }).format(new Date()),
      10
    );

    const SLOTS = { 9: 'Manhã', 14: 'Tarde', 21: 'Noite', 1: 'Madrugada' };
    const slot  = SLOTS[horaN];
    if (!slot) return;

    console.log(`[push-cron] Hora SP: ${horaN}h — slot: ${slot}`);

    const snap = await admin.firestore()
      .collection('usuarios')
      .where('gatilhos.horarios', 'array-contains', slot)
      .get();

    if (snap.empty) {
      console.log('[push-cron] Nenhum usuário com esse slot.');
      return;
    }

    const mensagens = [];
    const docRefs   = [];
    snap.forEach(docSnap => {
      const token = docSnap.data().pushToken;
      if (token) {
        mensagens.push({
          token,
          data: { acao: 'tela-vermelha' },
          notification: {
            title: 'LUMO',
            body: 'Este é um horário crítico para você. Toque para abrir o protocolo.',
          },
          android: { priority: 'high' },
          apns:    { payload: { aps: { sound: 'default' } } },
        });
        docRefs.push(docSnap.ref);
      }
    });

    if (mensagens.length === 0) {
      console.log('[push-cron] Nenhum token válido encontrado.');
      return;
    }

    console.log(`[push-cron] Enviando para ${mensagens.length} usuário(s)`);

    const LOTE = 500;
    const db   = admin.firestore();

    for (let i = 0; i < mensagens.length; i += LOTE) {
      const loteMensagens = mensagens.slice(i, i + LOTE);
      const loteRefs      = docRefs.slice(i, i + LOTE);

      const response = await admin.messaging().sendEach(loteMensagens);
      console.log(`[push-cron] Lote ${Math.floor(i / LOTE) + 1}: ${response.successCount} ok, ${response.failureCount} falha(s)`);

      if (response.failureCount > 0) {
        const writeBatch  = db.batch();
        let tokensRemovidos = 0;

        response.responses.forEach((res, idx) => {
          if (!res.success) {
            const code = res.error?.code ?? '';
            if (
              code === 'messaging/invalid-argument' ||
              code === 'messaging/registration-token-not-registered'
            ) {
              writeBatch.update(loteRefs[idx], { pushToken: admin.firestore.FieldValue.delete() });
              tokensRemovidos++;
            }
          }
        });

        if (tokensRemovidos > 0) {
          await writeBatch.commit();
          console.log(`[push-cron] Removidos ${tokensRemovidos} token(s) inválido(s) do Firestore.`);
        }
      }
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// PIX — Stripe
// ─────────────────────────────────────────────────────────────────────────────

// Cria e confirma um PaymentIntent PIX no Stripe.
// Retorna: { clientSecret, pixCode, pixQrUrl, expiresAt }
exports.criarPagamentoPix = onCall(
  { secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login necessário.');

    const { plano } = request.data; // 'mensal' | 'anual'
    if (!['mensal', 'anual'].includes(plano)) {
      throw new HttpsError('invalid-argument', 'Plano inválido.');
    }

    const Stripe = require('stripe');
    const stripe = Stripe(s(STRIPE_SECRET_KEY));

    const valorCentavos = plano === 'anual' ? 11700 : 1199; // R$117,00 ou R$11,99
    const diasPlano     = plano === 'anual' ? 365 : 30;

    let pi;
    try {
      pi = await stripe.paymentIntents.create({
        amount:   valorCentavos,
        currency: 'brl',
        payment_method_types: ['pix'],
        payment_method_data:  { type: 'pix' },
        confirm: true,
        metadata: {
          uid:   request.auth.uid,
          plano,
          dias:  String(diasPlano),
        },
      });
    } catch (err) {
      console.error('[pix] Erro ao criar PaymentIntent:', err.message);
      throw new HttpsError('internal', 'Erro ao gerar QR Code PIX.');
    }

    const pix = pi.next_action?.pix_display_qr_code;
    if (!pix) {
      console.error('[pix] next_action ausente:', pi.status);
      throw new HttpsError('internal', 'PIX indisponível no momento.');
    }

    return {
      paymentIntentId: pi.id,
      pixCode:  pix.data,
      pixQrUrl: pix.image_url_png,
      expiresAt: pix.expires_at, // unix timestamp
    };
  }
);

// Webhook Stripe — confirma pagamento PIX e ativa Pro no Firestore + Discord
exports.webhookStripe = onRequest(
  { secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_PIX, ...DISCORD_SECRETS], region: 'southamerica-east1' },
  async (req, res) => {
    const sig     = req.headers['stripe-signature'];
    const rawBody = req.rawBody;

    let event;
    try {
      const Stripe = require('stripe');
      const stripe = Stripe(s(STRIPE_SECRET_KEY));
      event = stripe.webhooks.constructEvent(rawBody, sig, s(STRIPE_WEBHOOK_PIX));
    } catch (err) {
      console.error('[webhook-stripe] Assinatura inválida:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type !== 'payment_intent.succeeded') {
      return res.status(200).send('ignored');
    }

    const pi  = event.data.object;
    const uid  = pi.metadata?.uid;
    const dias = parseInt(pi.metadata?.dias ?? '30', 10);
    const plano = pi.metadata?.plano ?? 'mensal';

    if (!uid) {
      console.error('[webhook-stripe] uid ausente no metadata');
      return res.status(200).send('sem uid');
    }

    const db  = admin.firestore();
    const now  = new Date();
    const venc = new Date(now.getTime() + dias * 24 * 60 * 60 * 1000);

    await db.collection('usuarios').doc(uid).set({
      pagamento: {
        pago:              true,
        plano,
        metodoPagamento:   'pix',
        dataUltimoPagamento: now.toISOString(),
        proximoVencimento: venc.toISOString(),
        paymentIntentId:   pi.id,
      },
    }, { merge: true });

    console.log(`[webhook-stripe] PIX confirmado — uid=${uid} plano=${plano} venc=${venc.toISOString()}`);

    // Transição Discord → @Pro
    try {
      await discordTransicionar(uid, 'pro', 'pagamento-pix');
    } catch (e) {
      console.error('[webhook-stripe] Discord falhou (não-fatal):', e.message);
    }

    return res.status(200).send('ok');
  }
);

// Cron diário — expira assinaturas PIX vencidas
exports.verificarExpiracaoProPix = onSchedule(
  { schedule: 'every 24 hours', secrets: [...DISCORD_SECRETS], region: 'southamerica-east1' },
  async () => {
    const db  = admin.firestore();
    const now = new Date().toISOString();

    const snap = await db.collection('usuarios')
      .where('pagamento.metodoPagamento', '==', 'pix')
      .where('pagamento.pago', '==', true)
      .where('pagamento.proximoVencimento', '<=', now)
      .get();

    if (snap.empty) {
      console.log('[expira-pix] Nenhuma assinatura PIX vencida.');
      return;
    }

    console.log(`[expira-pix] Expirando ${snap.size} assinatura(s) PIX.`);
    const batch = db.batch();

    for (const docSnap of snap.docs) {
      batch.update(docSnap.ref, { 'pagamento.pago': false });
      try {
        await discordTransicionar(docSnap.id, 'expirado', 'pix-vencido');
      } catch (e) {
        console.error(`[expira-pix] Discord falhou para ${docSnap.id}:`, e.message);
      }
    }

    await batch.commit();
    console.log('[expira-pix] Expiração concluída.');
  }
);
