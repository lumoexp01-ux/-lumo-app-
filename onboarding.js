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

  document.getElementById('btn-passo1').addEventListener('click', () => {
    const nome = inputNome.value.trim();
    if (!nome) {
      mostrarErro(inputNome, 'Precisa do seu nome para continuar');
      return;
    }
    if (nome.length > 60) {
      mostrarErro(inputNome, 'Nome muito longo');
      return;
    }
    dados.nome = nome;
    irParaPasso(1);
  });

  // ── PASSO 2 — Data ──
  const inputData   = document.getElementById('start-date');
  const displayData = document.getElementById('display-data');
  const hojeISO     = new Date().toISOString().split('T')[0];

  inputData.value = hojeISO;
  inputData.max   = hojeISO;
  displayData.textContent = formatarData(new Date(hojeISO + 'T12:00:00'));

  inputData.addEventListener('change', () => {
    const data = new Date(inputData.value + 'T12:00:00');
    displayData.textContent = formatarData(data);
    dados.startDate = inputData.value;
  });

  document.getElementById('btn-passo2').addEventListener('click', () => {
    irParaPasso(2);
  });

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

  // ── PASSO 5 — Ir para o app ──
  document.getElementById('btn-comecar').addEventListener('click', () => {
    // Salva em sessionStorage para a index usar enquanto Fragment 4.3 não persiste no Firestore
    sessionStorage.setItem('usuario', JSON.stringify({
      nome:             dados.nome,
      startDate:        dados.startDate,
      termosAceitos:    true,
      impulsosVencidos: 0,
      recaidas:         0,
    }));
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

});
