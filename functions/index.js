// functions/index.js — LUMO Cloud Functions
// Fragmento 7.0 — Segurança de acesso
// Corrigido: Timestamp nativo, set+merge, base64url no deviceId

'use strict';

const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule }         = require('firebase-functions/v2/scheduler');
const { setGlobalOptions }   = require('firebase-functions/v2');
const { defineSecret }       = require('firebase-functions/params');
const admin = require('firebase-admin');

const RC_SECRET_KEY  = defineSecret('RC_SECRET_KEY');
const WEBHOOK_SECRET = defineSecret('WEBHOOK_SECRET');

admin.initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

// ─────────────────────────────────────────────────────────────────────────────
// verificarAcesso — guard de acesso no servidor
//
// Lê `pagamento` direto do Firestore via Admin SDK.
// trialFim é Timestamp nativo — usa .toMillis() para comparar.
// ─────────────────────────────────────────────────────────────────────────────
exports.verificarAcesso = onCall({ cors: ['https://lumoexp01-ux.github.io', 'http://localhost:3000'], invoker: 'public' }, async (request) => {
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

    // Verificar trial ativo
    if (pagamento.trial === true && pagamento.trialFim) {
      // trialFim é Timestamp do Firestore — usa toMillis(); fallback para string ISO
      const trialFimMs = typeof pagamento.trialFim.toMillis === 'function'
        ? pagamento.trialFim.toMillis()
        : new Date(pagamento.trialFim).getTime();

      if (!isNaN(trialFimMs) && agora < trialFimMs) {
        const trialFimISO = typeof pagamento.trialFim.toDate === 'function'
          ? pagamento.trialFim.toDate().toISOString()
          : pagamento.trialFim;
        return { acesso: true, tipo: 'trial', trialFim: trialFimISO };
      }
    }

    // Verificar assinatura paga
    if (pagamento.pago === true) {
      return { acesso: true, tipo: 'pago', plano: pagamento.plano ?? null };
    }

    // trialVirgem: true = usuário nunca usou trial (ex: ativarTrial falhou por rede).
    // pagamento.js usa esse flag para exibir botão de recuperação, evitando
    // que falha de rede prive o usuário do trial gratuito para sempre.
    const trialVirgem = (pagamento.trialUsado !== true);
    return { acesso: false, motivo: 'sem-assinatura', trialVirgem };

  } catch (_) {
    throw new HttpsError('internal', 'Erro ao verificar acesso.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ativarTrial — ativa trial de 7 dias de forma segura no servidor
//
// Correções aplicadas:
//   1. trialFim salvo como Timestamp nativo (comparável em Firestore rules)
//   2. set+merge em vez de update (evita race condition: doc pode não ter
//      propagado entre setDoc e a chamada da CF)
//   3. deviceId encodado em base64url antes de virar ID de documento
//      (evita injeção de "/" no path do Firestore)
// ─────────────────────────────────────────────────────────────────────────────
exports.ativarTrial = onCall({ cors: ['https://lumoexp01-ux.github.io', 'http://localhost:3000'], invoker: 'public' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Login necessário.');
  }

  const uid      = request.auth.uid;
  const email    = (request.auth.token.email ?? '').toLowerCase().trim();
  // Fix 4: base64url no deviceId evita "/" no path do Firestore
  const rawDeviceId = String(request.data?.deviceId ?? '').slice(0, 128);
  const deviceKey   = rawDeviceId
    ? Buffer.from(rawDeviceId).toString('base64url')
    : '';

  try {
    const db = admin.firestore();

    // 1. Verificar se este UID já ativou trial
    const userSnap = await db.doc(`usuarios/${uid}`).get();
    if (userSnap.exists && userSnap.data().pagamento?.trialUsado === true) {
      return { sucesso: false, motivo: 'trial-ja-usado' };
    }

    // 2. Verificar se email já foi usado para trial (em qualquer conta)
    if (email) {
      const emailKey  = Buffer.from(email).toString('base64url');
      const emailSnap = await db.doc(`triaisUsados/email_${emailKey}`).get();
      if (emailSnap.exists) {
        return { sucesso: false, motivo: 'email-ja-usou-trial' };
      }
    }

    // 3. Verificar deviceKey (heurística — base64url garante path válido)
    if (deviceKey) {
      const deviceSnap = await db.doc(`triaisUsados/device_${deviceKey}`).get();
      if (deviceSnap.exists) {
        return { sucesso: false, motivo: 'device-ja-usou-trial' };
      }
    }

    // Tudo OK — calcular fim do trial
    const agora    = new Date();
    const trialFim = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fix 2: Timestamp nativo — Firestore rules podem comparar com request.time
    const trialFimTimestamp = admin.firestore.Timestamp.fromDate(trialFim);

    const batch = db.batch();

    // Fix 3: set+merge em vez de update — evita race condition com o setDoc
    // anterior no onboarding. Mesmo que o doc ainda não tenha propagado,
    // set+merge cria ou funde sem erro NOT_FOUND.
    batch.set(db.doc(`usuarios/${uid}`), {
      pagamento: {
        trial:      true,
        trialUsado: true,
        trialFim:   trialFimTimestamp,
        pago:       false,
        plano:      null,
      },
    }, { merge: true });

    // Marcar email como usado
    if (email) {
      const emailKey = Buffer.from(email).toString('base64url');
      batch.set(db.doc(`triaisUsados/email_${emailKey}`), {
        ativadoEm: admin.firestore.Timestamp.fromDate(agora),
      });
    }

    // Marcar device como usado
    if (deviceKey) {
      batch.set(db.doc(`triaisUsados/device_${deviceKey}`), {
        ativadoEm: admin.firestore.Timestamp.fromDate(agora),
      });
    }

    await batch.commit();

    console.log('Trial ativado');
    return { sucesso: true, trialFim: trialFim.toISOString() };

  } catch (err) {
    if (err.code) throw err;
    console.error('Erro em ativarTrial');
    throw new HttpsError('internal', 'Erro ao ativar trial.');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// ativarPagamento — chamado pelo cliente após purchasePackage() RC ser concluído
//
// Registra pagamento no Firestore APENAS se o RevenueCat confirmar o
// entitlement ativo usando a chave pública.
// O webhook (7.4) mantém as renovações e cancelamentos sincronizados.
// ─────────────────────────────────────────────────────────────────────────────
exports.ativarPagamento = onCall({ cors: ['https://lumoexp01-ux.github.io', 'http://localhost:3000'], invoker: 'public', secrets: [RC_SECRET_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Login necessário.');
  }

  const uid = request.auth.uid;
  const planoDesejado = request.data?.plano || 'desconhecido';

  try {
    // 1. Validação server-side no RevenueCat
    // v1 API usa a chave secreta para ler status do subscriber
    const RC_V1_KEY    = RC_SECRET_KEY.value(); 
    const rcCustomerId = uid;
    console.log('[ativarPagamento] Consultando RC v1 para customer:', rcCustomerId);
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${rcCustomerId}`,
      {
        headers: {
          'Authorization': `Bearer ${RC_V1_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    console.log('[ativarPagamento] RC status HTTP:', response.status);
    const rcData = await response.json();
    console.log('[ativarPagamento] RC entitlements:', JSON.stringify(rcData?.subscriber?.entitlements ?? {}));

    const entitlement = rcData?.subscriber?.entitlements?.['lumo_pro'];
    const expiracao   = entitlement?.expires_date;
    console.log('[ativarPagamento] entitlement lumo_pro:', entitlement ?? 'não encontrado');

    // Se não tem o entitlement ou já expirou, barra a requisição!
    if (!expiracao || new Date(expiracao).getTime() < Date.now()) {
      console.warn('[ativarPagamento] Acesso negado. RC status:', response.status, '| entitlements disponíveis:', Object.keys(rcData?.subscriber?.entitlements ?? {}));
      throw new HttpsError('permission-denied', 'Pagamento não confirmado pelo provedor.');
    }

    // 2. Se o RC confirmou, atualiza o Firestore de forma segura
    const identifier = entitlement.product_identifier || planoDesejado;

    await admin.firestore().doc(`usuarios/${uid}`).set({
      pagamento: {
        pago:       true,
        trial:      false,
        trialUsado: true,
        plano:      identifier,
        pagoEm:     admin.firestore.Timestamp.fromDate(new Date()),
      },
    }, { merge: true });

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
exports.webhookRevenueCat = onRequest({ secrets: [WEBHOOK_SECRET] }, async (req, res) => {
  // Verificar segredo do webhook
  const auth = req.headers['authorization'] ?? '';
  if (auth !== WEBHOOK_SECRET.value()) {
    return res.status(401).send('Não autorizado');
  }

  try {
    const event = req.body?.event;
    if (!event) return res.status(400).send('Sem evento');

    const uid = event.app_user_id;
    if (!uid) return res.status(400).send('Sem UID');

    const ref = admin.firestore().doc(`usuarios/${uid}`);

    switch (event.type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "PRODUCT_CHANGE":
        await ref.set({
          pagamento: {
            pago: true,
            trial: false,
            proximoVencimento: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
          }
        }, { merge: true });
        console.log(`Webhook: Assinatura renovada/ativada para UID ${uid}`);
        break;

      case "CANCELLATION":
      case "EXPIRATION":
        await ref.set({
          pagamento: {
            pago: false,
            canceladoEm: new Date().toISOString()
          }
        }, { merge: true });
        console.log(`Webhook: Assinatura expirada/cancelada para UID ${uid}`);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Erro no webhook:', err);
    res.status(500).send('Erro interno');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// enviarPushHorarioCritico — Notificação FCM nos horários críticos do usuário
//
// Roda a cada hora. Verifica se o período atual (Manhã/Tarde/Noite/Madrugada)
// no fuso de Brasília coincide com os gatilhos de horário salvos pelo usuário.
// Envia push somente para quem tem pushToken registrado naquele período.
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

    // Envia apenas nos horários de pico de cada período
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

    // Mantém refs alinhados com mensagens (só docs que têm pushToken)
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

    // FCM admite até 500 mensagens por lote
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
            // Token inválido ou app desinstalado — remove do Firestore
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
