// config.js — Fragmento 4.6
// Carrega perfil e config do FAB do Firestore; salva alterações automaticamente.

document.addEventListener('DOMContentLoaded', () => {
  if (!window.lumo) return;

  const { auth, db, onAuthStateChanged, doc, getDoc, updateDoc } = window.lumo;
  let uidAtual  = null;
  let configAtual = {};

  // ── Carrega dados do Firestore ──
  onAuthStateChanged(auth, async (userFirebase) => {
    if (!userFirebase) return;
    uidAtual = userFirebase.uid;

    const snap = await getDoc(doc(db, 'usuarios', uidAtual));
    if (!snap.exists()) return;

    const dados = snap.data();

    preencherPerfil(dados);

    if (dados.config) {
      configAtual = { ...dados.config };
      aplicarConfig(dados.config);
    }
  });

  // ── Preenche seção de perfil ──
  function preencherPerfil(dados) {
    const elNome  = document.getElementById('config-perfil-nome');
    const elEmail = document.getElementById('config-perfil-email');
    const elData  = document.getElementById('config-perfil-data');
    const elNivel = document.getElementById('config-perfil-nivel');

    if (elNome)  elNome.textContent  = dados.nome  || '—';
    if (elEmail) elEmail.textContent = dados.email || '—';

    if (elData && dados.startDate) {
      const d = new Date(dados.startDate + 'T12:00:00');
      elData.textContent = d.toLocaleDateString('pt-BR', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    }

    if (elNivel && dados.startDate) {
      const dias  = calcularDias(dados.startDate);
      const nivel = calcularNivel(dias);
      elNivel.textContent = `${nivel.nome} · ${dias} dias`;
    }
  }

  // ── Aplica config salva nos chips e toggle ──
  function aplicarConfig(config) {
    const mapa = {
      'config-chips-disfarce':     config.fabDisfarce,
      'config-chips-posicao':      config.fabPosicao,
      'config-chips-opacidade':    String(config.fabOpacidade ?? ''),
      'config-chips-tamanho':      config.fabTamanho,
      'config-chips-acao-toque':   config.fabAcaoToque,
      'config-chips-acao-segurar': config.fabAcaoSegurar,
    };

    Object.entries(mapa).forEach(([id, valor]) => {
      if (!valor && valor !== 0) return;
      const container = document.getElementById(id);
      if (!container) return;
      container.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.valor === String(valor));
      });
    });

    const toggle = document.getElementById('fab-toggle');
    if (toggle) toggle.checked = config.fabAtivo !== false;

    const inputNome = document.getElementById('config-contato-nome');
    const inputTel  = document.getElementById('config-contato-tel');
    if (inputNome) inputNome.value = config.contatoNome      || '';
    if (inputTel)  inputTel.value  = config.contatoTelefone  || '';
  }

  // ── Salva config no Firestore ──
  async function salvarConfig() {
    if (!uidAtual) return;
    try {
      await updateDoc(doc(db, 'usuarios', uidAtual), { config: configAtual });
    } catch (e) {
      console.log('Erro ao salvar config');
    }
  }

  // ── Wire-up: chips de config (seleção única por grupo) ──
  const gruposChip = {
    'config-chips-disfarce':     'fabDisfarce',
    'config-chips-posicao':      'fabPosicao',
    'config-chips-opacidade':    'fabOpacidade',
    'config-chips-tamanho':      'fabTamanho',
    'config-chips-acao-toque':   'fabAcaoToque',
    'config-chips-acao-segurar': 'fabAcaoSegurar',
  };

  Object.entries(gruposChip).forEach(([id, chaveConfig]) => {
    const container = document.getElementById(id);
    if (!container) return;
    container.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        let valor = chip.dataset.valor;
        if (chaveConfig === 'fabOpacidade') valor = Number(valor);
        configAtual[chaveConfig] = valor;
        salvarConfig();
      });
    });
  });

  // ── Wire-up: toggle FAB ──
  const toggle = document.getElementById('fab-toggle');
  if (toggle) {
    toggle.addEventListener('change', () => {
      configAtual.fabAtivo = toggle.checked;
      salvarConfig();
    });
  }

  // ── Wire-up: contato de confiança (debounce 800ms) ──
  let debounceContato = null;
  function onContatoChange() {
    clearTimeout(debounceContato);
    debounceContato = setTimeout(() => {
      const inputNome = document.getElementById('config-contato-nome');
      const inputTel  = document.getElementById('config-contato-tel');
      configAtual.contatoNome      = inputNome?.value.trim() || '';
      configAtual.contatoTelefone  = inputTel?.value.trim()  || '';
      salvarConfig();
    }, 800);
  }

  document.getElementById('config-contato-nome')?.addEventListener('input', onContatoChange);
  document.getElementById('config-contato-tel')?.addEventListener('input', onContatoChange);

});
