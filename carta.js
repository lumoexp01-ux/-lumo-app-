// carta.js — Fragmento 5.2
// Carta do Futuro: escrita, criptografia AES-GCM (Web Crypto), Firestore.

document.addEventListener('DOMContentLoaded', () => {
  if (!window.lumo) return;

  const { auth, db, onAuthStateChanged, doc, getDoc, updateDoc, deleteField } = window.lumo;
  let uidAtual = null;

  // ── Criptografia AES-GCM (Web Crypto API) ──
  // Chave derivada do UID do usuário via PBKDF2.
  // Conteúdo armazenado em Base64; IV aleatório por gravação.

  async function derivarChave(uid) {
    const enc  = new TextEncoder();
    const base = await crypto.subtle.importKey(
      'raw', enc.encode(uid), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: enc.encode('lumo-carta-v1'), iterations: 100000, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function criptografar(texto, uid) {
    const chave = await derivarChave(uid);
    const iv    = crypto.getRandomValues(new Uint8Array(12));
    const enc   = new TextEncoder();
    const cifra = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, chave, enc.encode(texto));
    return {
      conteudo: btoa(String.fromCharCode(...new Uint8Array(cifra))),
      iv:       btoa(String.fromCharCode(...iv)),
    };
  }

  async function descriptografar(conteudoB64, ivB64, uid) {
    const chave   = await derivarChave(uid);
    const cifra   = Uint8Array.from(atob(conteudoB64), c => c.charCodeAt(0));
    const iv      = Uint8Array.from(atob(ivB64),       c => c.charCodeAt(0));
    const claro   = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, chave, cifra);
    return new TextDecoder().decode(claro);
  }

  // ── Elementos da UI ──
  const textarea    = document.getElementById('carta-textarea');
  const btnSalvar   = document.getElementById('btn-salvar-carta');
  const btnApagar   = document.getElementById('btn-apagar-carta');
  const elChars     = document.getElementById('carta-chars');
  const elStatus    = document.getElementById('carta-status');
  const elData      = document.getElementById('carta-data');
  const elActions   = document.getElementById('carta-actions');
  const elSub       = document.getElementById('carta-sub');

  // ── Contador de caracteres ──
  textarea?.addEventListener('input', () => {
    const n = textarea.value.length;
    if (elChars) {
      elChars.textContent = `${n} / 2000`;
      elChars.classList.toggle('carta-box__chars--limite', n >= 1900);
    }
  });

  // ── Status helpers ──
  function mostrarStatus(msg, tipo = '') {
    if (!elStatus) return;
    elStatus.textContent = msg;
    elStatus.className = 'carta-status' + (tipo ? ` carta-status--${tipo}` : '');
  }

  // ── Exibe carta existente ──
  function exibirCarta(texto, criadaEm) {
    if (textarea) textarea.value = texto;
    if (elChars)  elChars.textContent = `${texto.length} / 2000`;
    if (elSub)    elSub.textContent   = 'Sua carta está salva';

    if (elData && criadaEm) {
      const d = new Date(criadaEm);
      elData.textContent = `Escrita em ${d.toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'long', year: 'numeric',
      })}`;
      elData.classList.remove('hidden');
    }

    if (elActions) elActions.classList.remove('hidden');
    if (btnSalvar) btnSalvar.textContent = 'Atualizar carta';
  }

  // ── Auth + carrega carta ──
  onAuthStateChanged(auth, async (userFirebase) => {
    if (!userFirebase) { window.location.href = 'onboarding.html'; return; }
    uidAtual = userFirebase.uid;

    const snap = await getDoc(doc(db, 'usuarios', uidAtual));
    if (!snap.exists()) return;

    const dados = snap.data();
    const carta = dados.carta;

    if (carta?.conteudo && carta?.iv) {
      try {
        const texto = await descriptografar(carta.conteudo, carta.iv, uidAtual);
        exibirCarta(texto, carta.criadaEm);

        // Salva no sessionStorage para intervencao.js usar
        const sessao = JSON.parse(sessionStorage.getItem('usuario') || '{}');
        sessao.carta = { conteudo: texto, criadaEm: carta.criadaEm };
        sessionStorage.setItem('usuario', JSON.stringify(sessao));
      } catch {
        mostrarStatus('Erro ao carregar carta.', 'erro');
      }
    }
  });

  // ── Salvar ──
  btnSalvar?.addEventListener('click', async () => {
    const texto = textarea?.value.trim() ?? '';
    if (!texto) { mostrarStatus('Escreva algo antes de salvar.'); return; }
    if (!uidAtual) return;

    btnSalvar.disabled = true;
    mostrarStatus('Salvando...');

    try {
      const { conteudo, iv } = await criptografar(texto, uidAtual);
      const criadaEm = new Date().toISOString();

      await updateDoc(doc(db, 'usuarios', uidAtual), {
        carta: { conteudo, iv, criadaEm },
      });

      // Atualiza sessionStorage
      const sessao = JSON.parse(sessionStorage.getItem('usuario') || '{}');
      sessao.carta = { conteudo: texto, criadaEm };
      sessionStorage.setItem('usuario', JSON.stringify(sessao));

      exibirCarta(texto, criadaEm);
      mostrarStatus('Carta salva com segurança.', 'ok');
      setTimeout(() => mostrarStatus(''), 2500);
    } catch {
      mostrarStatus('Erro ao salvar. Tente novamente.', 'erro');
    } finally {
      btnSalvar.disabled = false;
    }
  });

  // ── Apagar ──
  btnApagar?.addEventListener('click', async () => {
    if (!uidAtual) return;
    if (!confirm('Apagar sua carta permanentemente?')) return;

    try {
      await updateDoc(doc(db, 'usuarios', uidAtual), { carta: deleteField() });

      // Limpa sessionStorage
      const sessao = JSON.parse(sessionStorage.getItem('usuario') || '{}');
      delete sessao.carta;
      sessionStorage.setItem('usuario', JSON.stringify(sessao));

      if (textarea) textarea.value = '';
      if (elChars)  elChars.textContent = '0 / 2000';
      if (elData)   elData.classList.add('hidden');
      if (elActions) elActions.classList.add('hidden');
      if (elSub)    elSub.textContent = 'Escreva para quem você vai ser';
      if (btnSalvar) btnSalvar.textContent = 'Salvar carta';
      mostrarStatus('Carta apagada.', 'ok');
      setTimeout(() => mostrarStatus(''), 2000);
    } catch {
      mostrarStatus('Erro ao apagar.', 'erro');
    }
  });

});
