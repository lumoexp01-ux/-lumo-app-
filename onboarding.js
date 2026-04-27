// onboarding.js — Fragmento 4.2
// Auth Firebase: email/senha + Google. Onboarding de 5 passos.

document.addEventListener('DOMContentLoaded', () => {

  // ── Dados em memória (Fragment 4.3 vai persistir no Firestore) ──
  const dados = {
    nome:      '',
    startDate: new Date().toISOString().split('T')[0],
    // email e uid vêm do Firebase Auth após o passo 3
    termosAceitos: false,
  };

  // ── Referências aos passos e dots ──
  const passos = document.querySelectorAll('.step-wrapper');
  const dots   = document.querySelectorAll('.step-dots__dot');
  let passoAtual = 0;

  function irParaPasso(indice) {
    passos[passoAtual].classList.remove('step--visible');
    passos[passoAtual].classList.add('step--hidden');
    dots[passoAtual]?.classList.remove('active');
    dots[passoAtual]?.classList.add('done');

    passoAtual = indice;

    passos[passoAtual].classList.remove('step--hidden');
    passos[passoAtual].classList.add('step--visible');
    dots[passoAtual]?.classList.remove('done');
    dots[passoAtual]?.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Validação com mensagens amigáveis ──
  function mostrarErro(inputEl, mensagem) {
    limparErro(inputEl);
    const erro = document.createElement('p');
    erro.className = 'input-error';
    erro.textContent = mensagem;
    inputEl.parentNode.appendChild(erro);
    inputEl.style.borderColor = '#8a2020';
  }

  function limparErro(inputEl) {
    const existente = inputEl.parentNode.querySelector('.input-error');
    if (existente) existente.remove();
    inputEl.style.borderColor = '';
  }

  function mostrarErroBotao(mensagem) {
    const el = document.getElementById('erro-auth');
    if (el) { el.textContent = mensagem; return; }
    const p = document.createElement('p');
    p.id = 'erro-auth';
    p.className = 'input-error';
    p.style.textAlign = 'center';
    p.style.marginTop = '10px';
    p.textContent = mensagem;
    document.querySelector('#step-3 .step__footer').prepend(p);
  }

  function limparErroBotao() {
    document.getElementById('erro-auth')?.remove();
  }

  // ── PASSO 1 — Nome ──
  const inputNome = document.getElementById('nome');
  inputNome.addEventListener('input', () => limparErro(inputNome));

  const btnPasso1 = document.getElementById('btn-passo1');
  if (btnPasso1) {
    btnPasso1.addEventListener('click', () => {
      const nome = inputNome.value.trim();
      if (!nome) { mostrarErro(inputNome, 'Precisa do seu nome para continuar'); return; }
      if (nome.length > 60) { mostrarErro(inputNome, 'Nome muito longo'); return; }
      dados.nome = nome;
      irParaPasso(1);
    });
  }

  // ── PASSO 2 — Data (removido em v2.0; guards evitam crash) ──
  const inputData   = document.getElementById('start-date');
  const displayData = document.getElementById('display-data');
  const hojeISO     = new Date().toISOString().split('T')[0];

  if (inputData && displayData) {
    inputData.value = hojeISO;
    inputData.max   = hojeISO;
    displayData.textContent = formatarData(new Date(hojeISO + 'T12:00:00'));
    inputData.addEventListener('change', () => {
      const data = new Date(inputData.value + 'T12:00:00');
      displayData.textContent = formatarData(data);
      dados.startDate = inputData.value;
    });
  }

  const btnPasso2 = document.getElementById('btn-passo2');
  if (btnPasso2) {
    btnPasso2.addEventListener('click', () => { irParaPasso(2); });
  }

  // ── PASSO 3 — Auth ──
  const inputEmail = document.getElementById('email');
  const inputSenha = document.getElementById('senha');
  const btnAuth    = document.getElementById('btn-auth');
  const btnGoogle  = document.getElementById('btn-google');

  [inputEmail, inputSenha].forEach(el => {
    el.addEventListener('input', () => { limparErro(el); limparErroBotao(); });
  });

  function setCarregando(ligado) {
    btnAuth.classList.toggle('btn-loading', ligado);
    btnGoogle.classList.toggle('btn-loading', ligado);
    btnAuth.textContent = ligado ? 'Aguarde...' : 'Criar conta';
  }

  // Email + senha
  btnAuth.addEventListener('click', async () => {
    const email = inputEmail.value.trim();
    const senha = inputSenha.value;

    if (!email || !email.includes('@')) {
      mostrarErro(inputEmail, 'Esse email não parece certo');
      return;
    }
    if (senha.length < 6) {
      mostrarErro(inputSenha, 'Senha muito curta — usa pelo menos 6 caracteres');
      return;
    }

    limparErroBotao();
    setCarregando(true);

    const { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = window.lumo;

    try {
      // Tenta criar conta; se já existe, faz login
      try {
        await createUserWithEmailAndPassword(auth, email, senha);
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
          await signInWithEmailAndPassword(auth, email, senha);
        } else {
          throw e;
        }
      }
      await aposAutenticar();
    } catch (e) {
      // Mensagem genérica — nunca revelar se email existe (Brecha 6)
      mostrarErroBotao('Email ou senha incorretos. Tente novamente.');
      console.log('Erro de autenticação');
    } finally {
      setCarregando(false);
    }
  });

  // Google
  btnGoogle.addEventListener('click', async () => {
    limparErroBotao();
    setCarregando(true);
    const { auth, GoogleAuthProvider, signInWithPopup } = window.lumo;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await aposAutenticar();
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        mostrarErroBotao('Não foi possível entrar com Google. Tente novamente.');
      }
      console.log('Erro Google auth');
    } finally {
      setCarregando(false);
    }
  });

  // Após qualquer autenticação bem-sucedida
  async function aposAutenticar() {
    const { auth, db, doc, getDoc } = window.lumo;
    const uid = auth.currentUser.uid;

    // Verifica se já tem perfil completo (usuário retornando)
    const snap = await getDoc(doc(db, 'usuarios', uid));
    if (snap.exists() && snap.data()?.termos?.aceito) {
      // Usuário já passou pelo onboarding completo → vai direto para o app
      sessionStorage.setItem('usuario', JSON.stringify({
        nome:             snap.data().nome,
        startDate:        snap.data().startDate,
        impulsosVencidos: snap.data().impulsosVencidos ?? 0,
        recaidas:         snap.data().recaidas ?? 0,
      }));
      window.location.href = 'index.html';
      return;
    }

    // Novo usuário → preenche nome do Google se disponível
    const displayName = auth.currentUser.displayName;
    if (displayName && !dados.nome) {
      dados.nome = displayName.split(' ')[0];
    }

    irParaPasso(3); // → tela de termos
  }

  // ── PASSO 4 — Termos ──
  const checkTermos = document.getElementById('aceito-termos');
  const btnAceitar  = document.getElementById('btn-aceitar');

  checkTermos.addEventListener('change', () => {
    btnAceitar.disabled = !checkTermos.checked;
  });

  btnAceitar.addEventListener('click', () => {
    if (!checkTermos.checked) return;
    dados.termosAceitos = true;
    // Atualiza nome na tela de boas-vindas
    const elNome = document.getElementById('nome-boas-vindas');
    if (elNome) elNome.textContent = dados.nome || 'Ei';
    irParaPasso(4);
  });

  // Modal de termos completos
  const modalTermos = document.getElementById('modal-termos');
  document.getElementById('link-termos-completos').addEventListener('click', (e) => {
    e.preventDefault();
    modalTermos.classList.remove('hidden');
  });
  document.getElementById('modal-termos-fechar').addEventListener('click', () => {
    modalTermos.classList.add('hidden');
  });
  document.getElementById('modal-termos-overlay').addEventListener('click', () => {
    modalTermos.classList.add('hidden');
  });

  // ── PASSO 5 — Salvar perfil no Firestore e ir para o app ──
  document.getElementById('btn-comecar').addEventListener('click', async () => {
    console.log('Passo 5 clicado');

    const btnComecar = document.getElementById('btn-comecar');
    btnComecar.classList.add('btn-loading');
    btnComecar.textContent = 'Aguarde...';

    const { auth, db, doc, setDoc } = window.lumo;
    const uid = auth.currentUser?.uid;

    if (uid) {
      try {
        await setDoc(doc(db, 'usuarios', uid), {
          nome:             dados.nome,
          email:            auth.currentUser.email || '',
          startDate:        dados.startDate,
          impulsosVencidos: 0,
          recaidas:         0,
          gatilhos: { lugares: [], apps: [], horarios: [] },
          config: {
            fabAtivo:          true,
            fabDisfarce:       'Calculadora',
            fabPosicao:        'inferior-direita',
            fabOpacidade:      100,
            fabTamanho:        'medio',
            fabAcaoToque:      'cards',
            fabAcaoSegurar:    'menu',
            contatoNome:       '',
            contatoTelefone:   '',
          },
          termos: {
            aceito:    true,
            dataAceite: new Date().toISOString(),
            versao:    '1.0',
            plataforma: 'web',
          },
        });
        console.log('Perfil salvo no Firestore');
      } catch (e) {
        console.log('Erro ao salvar perfil — continuando com sessionStorage');
      }
    }

    sessionStorage.setItem('usuario', JSON.stringify({
      nome:             dados.nome,
      startDate:        dados.startDate,
      impulsosVencidos: 0,
      recaidas:         0,
    }));

    console.log('Redirecionando para index');
    document.body.style.opacity    = '0';
    document.body.style.transition = 'opacity 0.18s ease';
    setTimeout(() => { window.location.href = 'index.html'; }, 160);
  });

  // ── Helpers ──
  function formatarData(data) {
    return data.toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  // ── Login direto ("Já tenho conta") ──
  (function () {
    const stepQ1    = document.getElementById('step-q1');
    const stepLogin = document.getElementById('step-login');

    function trocarStep(mostrar, esconder) {
      esconder.classList.replace('step--visible', 'step--hidden');
      mostrar.classList.replace('step--hidden', 'step--visible');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.getElementById('link-ja-tenho-conta')?.addEventListener('click', (e) => {
      e.preventDefault();
      trocarStep(stepLogin, stepQ1);
    });

    document.getElementById('link-voltar-quiz')?.addEventListener('click', (e) => {
      e.preventDefault();
      trocarStep(stepQ1, stepLogin);
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

    function limparErroLogin() {
      if (erroLogin) erroLogin.style.display = 'none';
    }

    function setLoadingLogin(ligado) {
      [btnLoginDireto, btnGoogleLogin].forEach(btn => {
        if (btn) btn.classList.toggle('btn-loading', ligado);
      });
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
            nome:             d.nome,
            startDate:        d.startDate,
            impulsosVencidos: d.impulsosVencidos ?? 0,
            recaidas:         d.recaidas         ?? 0,
          }));
          document.body.style.opacity    = '0';
          document.body.style.transition = 'opacity 0.18s ease';
          setTimeout(() => { window.location.href = 'index.html'; }, 160);
        } else {
          // Auth existe mas onboarding incompleto → vai para cadastro
          trocarStep(document.getElementById('step-cadastro'), stepLogin);
        }
      } catch (e) {
        if (e.code !== 'auth/popup-closed-by-user') {
          mostrarErroLogin('Email ou senha incorretos.');
        }
        console.log('Erro login direto');
      } finally {
        setLoadingLogin(false);
      }
    }

    btnLoginDireto?.addEventListener('click', () => {
      const email = inputLoginEmail?.value.trim() ?? '';
      const senha = inputLoginSenha?.value ?? '';
      if (!email || !email.includes('@')) { mostrarErroLogin('Esse email não parece certo'); return; }
      if (senha.length < 6) { mostrarErroLogin('Senha muito curta — usa pelo menos 6 letras'); return; }
      const { auth, signInWithEmailAndPassword } = window.lumo;
      executarLogin(() => signInWithEmailAndPassword(auth, email, senha));
    });

    btnGoogleLogin?.addEventListener('click', () => {
      const { auth, GoogleAuthProvider, signInWithPopup } = window.lumo;
      executarLogin(async () => {
        await signInWithPopup(auth, new GoogleAuthProvider());
      });
    });

    [inputLoginEmail, inputLoginSenha].forEach(el => {
      el?.addEventListener('input', limparErroLogin);
    });
  })();

});
