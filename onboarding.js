// onboarding.js — Navegação entre os 3 passos do onboarding
// Fase 2, Fragmento 2.2
// Responsabilidade: steps, validação amigável, objeto usuario em memória

document.addEventListener('DOMContentLoaded', () => {

  // ── Objeto local do usuário (sem Firebase ainda) ──
  const usuario = {
    nome: '',
    email: '',
    senha: '',
    startDate: new Date().toISOString().split('T')[0],
  };

  // ── Referências aos passos ──
  const passos = document.querySelectorAll('.step-wrapper');
  const dots = document.querySelectorAll('.step-dots__dot');
  let passoAtual = 0;

  function irParaPasso(indice) {
    passos[passoAtual].classList.remove('step--visible');
    passos[passoAtual].classList.add('step--hidden');
    dots[passoAtual].classList.remove('active');
    dots[passoAtual].classList.add('done');

    passoAtual = indice;

    passos[passoAtual].classList.remove('step--hidden');
    passos[passoAtual].classList.add('step--visible');
    dots[passoAtual].classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Mensagem de erro amigável ──
  function mostrarErro(inputEl, mensagem) {
    limparErro(inputEl);
    const erro = document.createElement('p');
    erro.className = 'input-error';
    erro.textContent = mensagem;
    inputEl.parentNode.appendChild(erro);
    inputEl.style.borderColor = '#8a2020';
  }

  function limparErro(inputEl) {
    const erroExistente = inputEl.parentNode.querySelector('.input-error');
    if (erroExistente) erroExistente.remove();
    inputEl.style.borderColor = '';
  }

  // ── PASSO 1: nome, email, senha ──
  const inputNome  = document.getElementById('nome');
  const inputEmail = document.getElementById('email');
  const inputSenha = document.getElementById('senha');
  const btnPasso1  = document.getElementById('btn-passo1');

  [inputNome, inputEmail, inputSenha].forEach(el => {
    el.addEventListener('input', () => limparErro(el));
  });

  btnPasso1.addEventListener('click', () => {
    const nome  = inputNome.value.trim();
    const email = inputEmail.value.trim();
    const senha = inputSenha.value;

    if (!nome) {
      mostrarErro(inputNome, 'Precisa do seu nome para continuar');
      return;
    }
    if (!email || !email.includes('@')) {
      mostrarErro(inputEmail, 'Esse email não parece certo');
      return;
    }
    if (senha.length < 6) {
      mostrarErro(inputSenha, 'Senha muito curta — usa pelo menos 6 letras');
      return;
    }

    usuario.nome  = nome;
    usuario.email = email;
    usuario.senha = senha;

    irParaPasso(1);
  });

  // ── PASSO 2: data de início ──
  const inputData  = document.getElementById('start-date');
  const btnHoje    = document.getElementById('btn-hoje');
  const btnPasso2  = document.getElementById('btn-passo2');
  const displayData = document.getElementById('display-data');

  // Preenche a data com hoje por padrão
  const hoje = new Date();
  const hojeISO = hoje.toISOString().split('T')[0];
  if (inputData) {
    inputData.value = hojeISO;
    inputData.max   = hojeISO;
  }
  if (displayData) {
    displayData.textContent = formatarData(hoje);
  }

  if (inputData) {
    inputData.addEventListener('change', () => {
      const data = new Date(inputData.value + 'T12:00:00');
      if (displayData) displayData.textContent = formatarData(data);
      usuario.startDate = inputData.value;
    });
  }

  if (btnHoje) {
    btnHoje.addEventListener('click', () => {
      if (inputData) inputData.value = hojeISO;
      usuario.startDate = hojeISO;
      if (displayData) displayData.textContent = formatarData(hoje);
    });
  }

  btnPasso2.addEventListener('click', () => {
    irParaPasso(2);
    // Atualiza o nome na tela de boas-vindas
    const nomeExibido = document.getElementById('nome-boas-vindas');
    if (nomeExibido) nomeExibido.textContent = usuario.nome;
  });

  // ── PASSO 3: boas-vindas + ir para o app ──
  const btnComecar = document.getElementById('btn-comecar');

  btnComecar.addEventListener('click', () => {
    // Salva em sessionStorage para a index usar (sem Firebase ainda)
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.18s ease';
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 160);
  });

  // ── Helpers ──
  function formatarData(data) {
    return data.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

});
