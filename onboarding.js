// onboarding.js v2.0 — Fragmento 2.1
// Quiz (Q1-Q5) + Slides (S1-S4) + Solução + Cadastro + Termos + Boas-vindas

document.addEventListener('DOMContentLoaded', () => {

  // ── Estado ──
  const dados = {
    nome:          '',
    startDate:     new Date().toISOString().split('T')[0],
    termosAceitos: false,
  };

  const quiz = {
    genero: null, frequencia: null, tentouParar: null,
    controle: null, motivacoes: [],
  };

  // ── Navegação por step ID ──
  const PROGRESS = {
    'step-q1': 8,  'step-q2': 15, 'step-q3': 23, 'step-q4': 31, 'step-q5': 38,
    'step-s1': 46, 'step-s2': 54, 'step-s3': 61, 'step-s4': 69,
    'step-solucao': 77, 'step-cadastro': 85, 'step-termos': 92, 'step-boas-vindas': 100,
  };

  function irParaStep(id) {
    document.querySelectorAll('.step-wrapper').forEach(el => {
      el.classList.remove('step--visible');
      el.classList.add('step--hidden');
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.remove('step--hidden');
      target.classList.add('step--visible');
    }
    const bar = document.getElementById('ob-progress-bar');
    if (bar) bar.style.width = (PROGRESS[id] ?? 8) + '%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Quiz Q1–Q4: single-select + auto-avanço ──
  function wiredQuizSingle(stepId, campo, proximoId) {
    const step = document.getElementById(stepId);
    if (!step) return;
    step.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        step.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        quiz[campo] = opt.dataset.value;
        setTimeout(() => irParaStep(proximoId), 260);
      });
    });
  }

  wiredQuizSingle('step-q1', 'genero',      'step-q2');
  wiredQuizSingle('step-q2', 'frequencia',  'step-q3');
  wiredQuizSingle('step-q3', 'tentouParar', 'step-q4');
  wiredQuizSingle('step-q4', 'controle',    'step-q5');

  // ── Quiz Q5: multi-select ──
  const stepQ5 = document.getElementById('step-q5');
  if (stepQ5) {
    stepQ5.querySelectorAll('.quiz-option').forEach(opt => {
      opt.addEventListener('click', () => {
        opt.classList.toggle('selected');
        quiz.motivacoes = [...stepQ5.querySelectorAll('.quiz-option.selected')]
          .map(o => o.dataset.value);
      });
    });
  }
  document.getElementById('btn-q5')?.addEventListener('click', () => {
    sessionStorage.setItem('quiz', JSON.stringify(quiz));
    irParaStep('step-s1');
  });

  // ── Slides ──
  document.getElementById('btn-s1')?.addEventListener('click', () => irParaStep('step-s2'));
  document.getElementById('btn-s2')?.addEventListener('click', () => irParaStep('step-s3'));
  document.getElementById('btn-s3')?.addEventListener('click', () => irParaStep('step-s4'));
  document.getElementById('btn-s4')?.addEventListener('click', () => irParaStep('step-solucao'));

  // ── Solução → Cadastro ──
  document.getElementById('btn-solucao')?.addEventListener('click', () => irParaStep('step-cadastro'));

  // ── Cadastro: Auth ──
  const inputNome  = document.getElementById('nome');
  const inputEmail = document.getElementById('email');
  const inputSenha = document.getElementById('senha');
  const btnAuth    = document.getElementById('btn-auth');
  const btnGoogle  = document.getElementById('btn-google');

  function mostrarErro(inputEl, msg) {
    if (!inputEl) return;
    inputEl.style.borderColor = '#8a2020';
    const erroEl = inputEl.closest('.field-group')?.querySelector('.input-error');
    if (erroEl) { erroEl.textContent = msg; erroEl.style.display = 'block'; }
  }

  function limparErro(inputEl) {
    if (!inputEl) return;
    inputEl.style.borderColor = '';
    const erroEl = inputEl.closest('.field-group')?.querySelector('.input-error');
    if (erroEl) erroEl.style.display = 'none';
  }

  function mostrarErroBotao(msg) {
    let el = document.getElementById('erro-auth');
    if (!el) {
      el = document.createElement('p');
      el.id = 'erro-auth';
      el.className = 'input-error';
      el.style.cssText = 'text-align:center;margin-top:10px;display:block;';
      document.querySelector('#step-cadastro .step__footer')?.prepend(el);
    }
    el.textContent = msg;
  }

  function limparErroBotao() { document.getElementById('erro-auth')?.remove(); }

  [inputEmail, inputSenha].forEach(el => {
    el?.addEventListener('input', () => { limparErro(el); limparErroBotao(); });
  });

  function setCarregando(ligado) {
    [btnAuth, btnGoogle].forEach(btn => btn?.classList.toggle('btn-loading', ligado));
    if (btnAuth) btnAuth.textContent = ligado ? 'Aguarde...' : 'Criar conta';
  }

  async function aposAutenticar() {
    if (!window.lumo) return;
    const { auth, db, doc, getDoc } = window.lumo;
    const uid = auth.currentUser.uid;

    const snap = await getDoc(doc(db, 'usuarios', uid));
    if (snap.exists() && snap.data()?.termos?.aceito) {
      const d = snap.data();
      sessionStorage.setItem('usuario', JSON.stringify({
        nome:             d.perfil?.nome      ?? d.nome      ?? '',
        startDate:        d.perfil?.startDate ?? d.startDate ?? dados.startDate,
        impulsosVencidos: d.progresso?.impulsosVencidos ?? d.impulsosVencidos ?? 0,
        recaidas:         d.progresso?.recaidas          ?? d.recaidas         ?? 0,
      }));
      window.location.href = 'index.html';
      return;
    }

    // Novo usuário: preenche nome do Google se disponível
    const displayName = auth.currentUser.displayName;
    if (displayName && inputNome && !inputNome.value.trim()) {
      inputNome.value = displayName.split(' ')[0];
    }
    irParaStep('step-termos');
  }

  btnAuth?.addEventListener('click', async () => {
    const nome  = inputNome?.value.trim()  ?? '';
    const email = inputEmail?.value.trim() ?? '';
    const senha = inputSenha?.value        ?? '';

    if (!nome)                    { mostrarErro(inputNome,  'Precisa do seu nome para continuar'); return; }
    if (!email || !email.includes('@')) { mostrarErro(inputEmail, 'Esse email não parece certo'); return; }
    if (senha.length < 6)         { mostrarErro(inputSenha, 'Senha muito curta — usa pelo menos 6 letras'); return; }

    limparErroBotao();
    setCarregando(true);
    dados.nome = nome;

    const { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = window.lumo;
    try {
      try {
        await createUserWithEmailAndPassword(auth, email, senha);
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
          await signInWithEmailAndPassword(auth, email, senha);
        } else { throw e; }
      }
      await aposAutenticar();
    } catch (e) {
      mostrarErroBotao('Email ou senha incorretos.');
      console.log('Erro auth');
    } finally {
      setCarregando(false);
    }
  });

  btnGoogle?.addEventListener('click', async () => {
    limparErroBotao();
    dados.nome = inputNome?.value.trim() || '';
    setCarregando(true);
    const { auth, GoogleAuthProvider, signInWithPopup } = window.lumo;
    try {
      console.log('Iniciando Google Auth (cadastro)...');
      const resultado = await signInWithPopup(auth, new GoogleAuthProvider());
      console.log('Sucesso:', resultado.user.email);
      await aposAutenticar();
    } catch (e) {
      console.log('Código do erro:', e.code);
      console.log('Mensagem:', e.message);
      if (e.code !== 'auth/popup-closed-by-user') {
        mostrarErroBotao('Não foi possível entrar com Google. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  });

  // ── Termos ──
  const checkTermos = document.getElementById('aceito-termos');
  const btnAceitar  = document.getElementById('btn-aceitar');

  checkTermos?.addEventListener('change', () => {
    if (btnAceitar) btnAceitar.disabled = !checkTermos.checked;
  });

  btnAceitar?.addEventListener('click', () => {
    if (!checkTermos?.checked) return;
    dados.termosAceitos = true;
    dados.nome = inputNome?.value.trim() || dados.nome;
    const el = document.getElementById('nome-boas-vindas');
    if (el) el.textContent = dados.nome || 'guerreiro';
    irParaStep('step-boas-vindas');
  });

  const modalTermos = document.getElementById('modal-termos');
  document.getElementById('link-termos-completos')?.addEventListener('click', (e) => {
    e.preventDefault();
    modalTermos?.classList.remove('hidden');
  });
  document.getElementById('modal-termos-fechar')?.addEventListener('click', () => {
    modalTermos?.classList.add('hidden');
  });
  document.getElementById('modal-termos-overlay')?.addEventListener('click', () => {
    modalTermos?.classList.add('hidden');
  });

  // ── Boas-vindas: salvar perfil + ativar trial + ir para o app ──
  document.getElementById('btn-comecar')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-comecar');
    if (btn) { btn.classList.add('btn-loading'); btn.textContent = 'Aguarde...'; }

    if (window.lumo) {
      const { auth, db, doc, setDoc } = window.lumo;
      const uid = auth.currentUser?.uid;
      if (uid) {
        const agora    = new Date();
        const fimTrial = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000);
        try {
          await setDoc(doc(db, 'usuarios', uid), {
            perfil: {
              nome:         dados.nome,
              email:        auth.currentUser.email || '',
              startDate:    dados.startDate,
              dataCadastro: agora.toISOString(),
              idioma:       'pt',
              sistema:      'web',
            },
            progresso: {
              impulsosVencidos:  0,
              recaidas:          0,
              sequenciaAtual:    0,
              historicoRecaidas: [],
            },
            gatilhos: { lugares: [], apps: [], horarios: [] },
            config: {
              fab: {
                ativo: true, disfarce: 'Calculadora', posicao: 'inferior-direita',
                opacidade: 100, tamanho: 'medio', acaoToque: 'cards', acaoSegurar: 'menu',
              },
              contato:      { nome: '', telefone: '' },
              notificacoes: false,
            },
            termos: {
              aceito: true, dataAceite: agora.toISOString(), versao: '1.0', plataforma: 'web',
            },
            pagamento: {
              trial: true, trialFim: fimTrial.toISOString(), pago: false,
              plano: null, assinaturaId: null, proximoVencimento: null, canceladoEm: null,
            },
          });
        } catch (e) { console.log('Erro ao salvar perfil'); }
      }
    }

    sessionStorage.setItem('usuario', JSON.stringify({
      nome: dados.nome, startDate: dados.startDate,
      impulsosVencidos: 0, recaidas: 0,
    }));

    document.body.style.opacity    = '0';
    document.body.style.transition = 'opacity 0.18s ease';
    setTimeout(() => { window.location.href = 'index.html'; }, 160);
  });

  // ── Login direto ("Já tenho conta") ──
  (function () {
    const stepQ1    = document.getElementById('step-q1');
    const stepLogin = document.getElementById('step-login');

    function trocarStep(mostrar, esconder) {
      if (esconder) { esconder.classList.remove('step--visible'); esconder.classList.add('step--hidden'); }
      if (mostrar)  { mostrar.classList.remove('step--hidden');  mostrar.classList.add('step--visible'); }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.getElementById('link-ja-tenho-conta')?.addEventListener('click', (e) => {
      e.preventDefault();
      trocarStep(stepLogin, stepQ1);
      const bar = document.getElementById('ob-progress-bar');
      if (bar) bar.style.width = '0%';
    });

    document.getElementById('link-voltar-quiz')?.addEventListener('click', (e) => {
      e.preventDefault();
      trocarStep(stepQ1, stepLogin);
      const bar = document.getElementById('ob-progress-bar');
      if (bar) bar.style.width = '8%';
    });

    const btnLoginDireto  = document.getElementById('btn-login-direto');
    const btnGoogleLogin  = document.getElementById('btn-google-login');
    const inputLoginEmail = document.getElementById('login-email');
    const inputLoginSenha = document.getElementById('login-senha');
    const erroLogin       = document.getElementById('erro-login-direto');

    function mostrarErroLogin(msg) {
      if (!erroLogin) return;
      erroLogin.textContent = msg;
      erroLogin.style.display = 'block';
    }

    function limparErroLogin() { if (erroLogin) erroLogin.style.display = 'none'; }

    function setLoadingLogin(ligado) {
      [btnLoginDireto, btnGoogleLogin].forEach(btn => btn?.classList.toggle('btn-loading', ligado));
      if (btnLoginDireto) btnLoginDireto.textContent = ligado ? 'Aguarde...' : 'Entrar';
    }

    async function executarLogin(loginFn) {
      if (!window.lumo) { mostrarErroLogin('Sem conexão agora. Tenta em alguns segundos.'); return; }
      const { auth, db, doc, getDoc } = window.lumo;
      setLoadingLogin(true);
      limparErroLogin();
      try {
        await loginFn();
        const uid  = auth.currentUser.uid;
        const snap = await getDoc(doc(db, 'usuarios', uid));
        if (snap.exists() && snap.data()?.termos?.aceito) {
          const d = snap.data();
          sessionStorage.setItem('usuario', JSON.stringify({
            nome:             d.perfil?.nome      ?? d.nome      ?? '',
            startDate:        d.perfil?.startDate ?? d.startDate ?? new Date().toISOString().split('T')[0],
            impulsosVencidos: d.progresso?.impulsosVencidos ?? d.impulsosVencidos ?? 0,
            recaidas:         d.progresso?.recaidas          ?? d.recaidas         ?? 0,
          }));
          document.body.style.opacity = '0';
          document.body.style.transition = 'opacity 0.18s ease';
          setTimeout(() => { window.location.href = 'index.html'; }, 160);
        } else {
          irParaStep('step-cadastro');
        }
      } catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') mostrarErroLogin('Email ou senha incorretos.');
      } finally {
        setLoadingLogin(false);
      }
    }

    btnLoginDireto?.addEventListener('click', () => {
      const email = inputLoginEmail?.value.trim() ?? '';
      const senha = inputLoginSenha?.value        ?? '';
      if (!email || !email.includes('@')) { mostrarErroLogin('Esse email não parece certo'); return; }
      if (senha.length < 6) { mostrarErroLogin('Senha muito curta — usa pelo menos 6 letras'); return; }
      const { auth, signInWithEmailAndPassword } = window.lumo;
      executarLogin(() => signInWithEmailAndPassword(auth, email, senha));
    });

    btnGoogleLogin?.addEventListener('click', async () => {
      const { auth, GoogleAuthProvider, signInWithPopup } = window.lumo;
      try {
        console.log('Iniciando Google Auth (login direto)...');
        const resultado = await signInWithPopup(auth, new GoogleAuthProvider());
        console.log('Sucesso:', resultado.user.email);
        executarLogin(async () => resultado);
      } catch (e) {
        console.log('Código do erro:', e.code);
        console.log('Mensagem:', e.message);
      }
    });

    [inputLoginEmail, inputLoginSenha].forEach(el => el?.addEventListener('input', limparErroLogin));
  })();

});
