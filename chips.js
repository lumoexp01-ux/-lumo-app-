// chips.js — Chips interativos da tela de gatilhos
// Fase 2, Fragmento 2.4
// Responsabilidade: toggle ativo/inativo, estado em array JS, atualizar card padrão

document.addEventListener('DOMContentLoaded', () => {

  // ── Estado local ──
  const gatilhos = {
    lugares:  [],
    apps:     [],
    horarios: [],
  };

  // ── Inicializa chips de cada grupo ──
  inicializarGrupo('chips-lugares',  'lugares');
  inicializarGrupo('chips-apps',     'apps');
  inicializarGrupo('chips-horarios', 'horarios');

  function inicializarGrupo(containerId, chave) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Carrega estado inicial dos chips marcados no HTML
    container.querySelectorAll('.chip.active').forEach(chip => {
      const valor = chip.dataset.valor || chip.textContent.trim();
      if (!gatilhos[chave].includes(valor)) gatilhos[chave].push(valor);
    });

    container.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const valor = chip.dataset.valor || chip.textContent.trim();
        const ativo = chip.classList.toggle('active');

        if (ativo) {
          if (!gatilhos[chave].includes(valor)) gatilhos[chave].push(valor);
        } else {
          gatilhos[chave] = gatilhos[chave].filter(v => v !== valor);
        }

        atualizarPadrao();
      });
    });
  }

  // ── Atualiza card "Padrão identificado" ──
  function atualizarPadrao() {
    const cardPadrao    = document.getElementById('pattern-card');
    const textoRisco    = document.getElementById('pattern-risk');
    const nenhumPadrao  = document.getElementById('pattern-empty');

    const temSeleção =
      gatilhos.lugares.length > 0 ||
      gatilhos.apps.length > 0    ||
      gatilhos.horarios.length > 0;

    if (!cardPadrao) return;

    if (!temSeleção) {
      if (nenhumPadrao)  nenhumPadrao.classList.remove('hidden');
      if (textoRisco)    textoRisco.classList.add('hidden');
      return;
    }

    if (nenhumPadrao) nenhumPadrao.classList.add('hidden');
    if (textoRisco)   textoRisco.classList.remove('hidden');

    // Monta a string do padrão
    const partes = [
      ...gatilhos.apps,
      ...gatilhos.lugares,
      ...gatilhos.horarios,
    ];

    const risco = document.getElementById('pattern-risk-text');
    if (risco) {
      risco.innerHTML = partes
        .map(p => `<span>${p}</span>`)
        .join(' · ');
    }
  }

  // Roda uma vez ao carregar para refletir estado inicial do HTML
  atualizarPadrao();

  // ── Fragmento 4.5 — Carregar e salvar gatilhos no Firestore ──
  if (!window.lumo) return;

  const { auth, db, onAuthStateChanged, doc, getDoc, updateDoc } = window.lumo;
  let uidAtual = null;

  onAuthStateChanged(auth, async (userFirebase) => {
    if (!userFirebase) return;
    uidAtual = userFirebase.uid;

    const snap = await getDoc(doc(db, 'usuarios', uidAtual));
    if (!snap.exists()) return;
    const salvos = snap.data().gatilhos;
    if (!salvos) return;

    ['lugares', 'apps', 'horarios'].forEach(chave => {
      const valores = salvos[chave] || [];
      const container = document.getElementById(`chips-${chave}`);
      if (!container) return;
      gatilhos[chave] = [];
      container.querySelectorAll('.chip').forEach(chip => {
        const valor = chip.dataset.valor || chip.textContent.trim();
        const ativo = valores.includes(valor);
        chip.classList.toggle('active', ativo);
        if (ativo) gatilhos[chave].push(valor);
      });
    });

    atualizarPadrao();
  });

  const btnSalvar = document.getElementById('btn-salvar-gatilhos');
  if (!btnSalvar) return;

  btnSalvar.addEventListener('click', async () => {
    if (!uidAtual) return;
    const textoOriginal = btnSalvar.textContent;
    btnSalvar.textContent = 'Salvando...';
    btnSalvar.disabled = true;

    try {
      await updateDoc(doc(db, 'usuarios', uidAtual), { gatilhos });
      btnSalvar.textContent = 'Salvo ✓';
      setTimeout(() => { btnSalvar.textContent = textoOriginal; btnSalvar.disabled = false; }, 1500);
    } catch (e) {
      console.log('Erro ao salvar gatilhos');
      btnSalvar.textContent = textoOriginal;
      btnSalvar.disabled = false;
    }
  });

});
