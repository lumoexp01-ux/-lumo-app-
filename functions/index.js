// functions/index.js — LUMO Cloud Functions
// Fragmento 7.0 — Segurança de acesso
// Corrigido: Timestamp nativo, set+merge, base64url no deviceId

'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { setGlobalOptions }   = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

// ─────────────────────────────────────────────────────────────────────────────
// verificarAcesso — guard de acesso no servidor
//
// Lê `pagamento` direto do Firestore via Admin SDK.
// trialFim é Timestamp nativo — usa .toMillis() para comparar.
// ─────────────────────────────────────────────────────────────────────────────
exports.verificarAcesso = onCall(async (request) => {
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
exports.ativarTrial = onCall(async (request) => {
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
exports.ativarPagamento = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Login necessário.');
  }

  const uid = request.auth.uid;
  const RC_PUBLIC_KEY = 'strp_sb_MiOlkXfcKatnRgaZDFrOBLBR';
  const planoDesejado = request.data?.plano || 'desconhecido';

  try {
    // 1. Validação server-side no RevenueCat
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${uid}`, {
      headers: {
        'Authorization': `Bearer ${RC_PUBLIC_KEY}`,
        'Accept': 'application/json'
      }
    });

    const rcData = await response.json();
    const entitlement = rcData?.subscriber?.entitlements?.['lumo Pro'];
    const expiracao = entitlement?.expires_date;

    // Se não tem o entitlement ou já expirou, barra a requisição!
    if (!expiracao || new Date(expiracao).getTime() < Date.now()) {
      console.warn('Tentativa de acesso não confirmada pelo RC:', uid);
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
// webhookRevenueCat — adicionado no Fragmento 7.4
// verificarDiscord    — adicionado no Fragmento 7.5
// ─────────────────────────────────────────────────────────────────────────────
