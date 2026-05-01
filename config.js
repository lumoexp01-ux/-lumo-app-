// config.js — Fragmento 4.6 (v2.0)
// Carrega perfil e config do FAB do Firestore; salva alterações em tempo real.

document.addEventListener('DOMContentLoaded', () => {
  if (!window.lumo) return;

  const { auth, db, onAuthStateChanged, doc, getDoc, updateDoc } = window.lumo;
  let uidAtual   = null;
  let fabAtual   = {};
  let contatoAtual = {};

  // ── Guard de auth ──
  onAuthStateChanged(auth, async (userFirebase) => {
    if (!userFirebase) { window.location.href = 'onboarding.html'; return; }
    uidAtual = userFirebase.uid;

    const snap = await getDoc(doc(db, 'usuarios', uidAtual));
    if (!snap.exists()) { window.location.href = 'onboarding.html'; return; }

    const dados = snap.data();

    preencherPerfil(dados);

    // Suporta v2.0 (aninhada) e v1.x (plana)
    fabAtual     = dados.config?.fab     ?? {};
    contatoAtual = dados.config?.contato ?? {};

    aplicarFab(fabAtual);
    aplicarContato(contatoAtual);
  });

  // ── Preenche seção de perfil ──
  function preencherPerfil(dados) {
    const nome     = dados.perfil?.nome      ?? dados.nome      ?? '—';
    const email    = dados.perfil?.email     ?? dados.email     ?? '—';
    const startDate = dados.perfil?.startDate ?? dados.startDate ?? null;

    const elNome  = document.getElementById('config-perfil-nome');
    const elEmail = document.getElementById('config-perfil-email');
    const elData  = document.getElementById('config-perfil-data');
    const elNivel = document.getElementById('config-perfil-nivel');

    if (elNome)  elNome.textContent  = nome;
    if (elEmail) elEmail.textContent = email;

    if (elData && startDate) {
      const d = new Date(startDate + 'T12:00:00');
      elData.textContent = d.toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    }

    if (elNivel && startDate && typeof calcularDias === 'function') {
      const dias  = calcularDias(startDate);
      const nivel = calcularNivel(dias);
      elNivel.textContent = `${nivel.nome} · ${dias} dias`;
    }
  }

  // ── Aplica config.fab salva nos chips e toggle ──
  function aplicarFab(fab) {
    const mapa = {
      'config-chips-disfarce':     fab.disfarce,
      'config-chips-posicao':      fab.posicao,
      'config-chips-opacidade':    String(fab.opacidade ?? ''),
      'config-chips-tamanho':      fab.tamanho,
      'config-chips-acao-toque':   fab.acaoToque,
      'config-chips-acao-segurar': fab.acaoSegurar,
    };

    Object.entries(mapa).forEach(([id, valor]) => {
      if (!valor && valor !== '0') return;
      const container = document.getElementById(id);
      if (!container) return;
      container.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.valor === String(valor));
      });
    });

    const toggle = document.getElementById('fab-toggle');
    if (toggle) toggle.checked = fab.ativo !== false;
  }

  // ── Aplica config.contato nos inputs ──
  function aplicarContato(contato) {
    const inputNome = document.getElementById('config-contato-nome');
    const inputTel  = document.getElementById('config-contato-tel');
    if (inputNome) inputNome.value = contato.nome      || '';
    if (inputTel)  inputTel.value  = contato.telefone  || '';
  }

  // ── Salva config.fab no Firestore ──
  async function salvarFab() {
    if (!uidAtual) return;
    try {
      await updateDoc(doc(db, 'usuarios', uidAtual), { 'config.fab': fabAtual });
      // Propaga para o FAB visível na página (se houver)
      window.aplicarConfigFab?.(fabAtual);
    } catch (e) {
      console.log('Erro ao salvar config FAB');
    }
  }

  // ── Salva config.contato no Firestore ──
  async function salvarContato() {
    if (!uidAtual) return;
    try {
      await updateDoc(doc(db, 'usuarios', uidAtual), { 'config.contato': contatoAtual });
    } catch (e) {
      console.log('Erro ao salvar contato');
    }
  }

  // ── Wire-up: chips de config FAB (seleção única por grupo) ──
  const gruposChip = {
    'config-chips-disfarce':     'disfarce',
    'config-chips-posicao':      'posicao',
    'config-chips-opacidade':    'opacidade',
    'config-chips-tamanho':      'tamanho',
    'config-chips-acao-toque':   'acaoToque',
    'config-chips-acao-segurar': 'acaoSegurar',
  };

  Object.entries(gruposChip).forEach(([id, campo]) => {
    const container = document.getElementById(id);
    if (!container) return;
    container.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        let valor = chip.dataset.valor;
        if (campo === 'opacidade') valor = Number(valor);
        fabAtual[campo] = valor;
        salvarFab();
      });
    });
  });

  // ── Wire-up: toggle FAB ativar/desativar ──
  const toggle = document.getElementById('fab-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      fabAtual.ativo = toggle.checked;
      salvarFab();
    });
  }

  // ── Wire-up: contato de confiança (debounce 800ms) ──
  let debounceContato = null;
  function onContatoChange() {
    clearTimeout(debounceContato);
    debounceContato = setTimeout(() => {
      contatoAtual.nome      = document.getElementById('config-contato-nome')?.value.trim() || '';
      contatoAtual.telefone  = document.getElementById('config-contato-tel')?.value.trim()  || '';
      salvarContato();
    }, 800);
  }

  document.getElementById('config-contato-nome')?.addEventListener('input', onContatoChange);
  document.getElementById('config-contato-tel')?.addEventListener('input', onContatoChange);

  // ── Seção iOS ──
  const isIOS = window.lumoPlatform?.isIOS ?? /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    const iosSection = document.getElementById('ios-section');
    if (iosSection) iosSection.classList.remove('hidden');

    const isStandalone = window.navigator.standalone === true;
    const statusEl     = document.getElementById('ios-push-status');
    const btnPushIOS   = document.getElementById('btn-ativar-push-ios');

    if (isStandalone) {
      // App está na tela inicial — pode pedir push
      if (statusEl) statusEl.textContent = 'O app está na tela inicial. Ative as notificações abaixo.';
      if (btnPushIOS) {
        btnPushIOS.style.display = 'block';
        btnPushIOS.addEventListener('click', async () => {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            if (statusEl) statusEl.textContent = 'Notificações ativadas ✓';
            btnPushIOS.style.display = 'none';
            // Inicializa push agora que a permissão foi concedida
            if (window.lumo?.auth?.currentUser) {
              window.inicializarPush?.(window.lumo.auth.currentUser.uid);
            }
          } else {
            if (statusEl) statusEl.textContent = 'Permissão negada. Ative em Ajustes → Notificações → LUMO.';
          }
        });
      }
    }
  }

});
