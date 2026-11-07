(() => {
  'use strict';

  /* 1) Animação de entrada ao rolar a página (igual às outras páginas) */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');

  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    reveals.forEach((el) => observer.observe(el));
  }

  /* 2) Abas: o tipo de apoio escolhido mostra só os cartões daquele tipo.
        Sem JavaScript, todos os cartões ficam visíveis, um tipo abaixo do outro. */
  const abas = Array.from(document.querySelectorAll('.apoio-aba'));
  const paineis = Array.from(document.querySelectorAll('.apoio-painel'));

  function selecionar(aba, { foco = false, atualizarEndereco = true } = {}) {
    abas.forEach((item) => {
      const ativa = item === aba;
      item.setAttribute('aria-selected', String(ativa));
      item.tabIndex = ativa ? 0 : -1;
      item.classList.toggle('is-ativa', ativa);
    });
    paineis.forEach((painel) => {
      painel.hidden = painel.id !== aba.getAttribute('aria-controls');
    });
    if (foco) aba.focus();
    if (atualizarEndereco && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + aba.dataset.hash);
    }
  }

  if (abas.length) {
    abas.forEach((aba, indice) => {
      aba.addEventListener('click', () => selecionar(aba));
      aba.addEventListener('keydown', (evento) => {
        let destino = null;
        if (evento.key === 'ArrowRight') destino = abas[(indice + 1) % abas.length];
        if (evento.key === 'ArrowLeft') destino = abas[(indice - 1 + abas.length) % abas.length];
        if (evento.key === 'Home') destino = abas[0];
        if (evento.key === 'End') destino = abas[abas.length - 1];
        if (destino) {
          evento.preventDefault();
          selecionar(destino, { foco: true });
        }
      });
    });

    // Endereço direto: doe.html#voluntariado, #apadrinhar, #empresas ou #doar já abre a aba certa
    const escolherPeloEndereco = () => {
      const chave = decodeURIComponent(window.location.hash.replace('#', ''));
      const alvo = abas.find((aba) => aba.dataset.hash === chave);
      selecionar(alvo || abas[0], { atualizarEndereco: false });
    };
    escolherPeloEndereco();
    window.addEventListener('hashchange', escolherPeloEndereco);
  }

  /* 3) Se um logotipo não carregar, esconde a imagem e mostra a letra inicial */
  document.querySelectorAll('.apoio-logo img').forEach((img) => {
    const esconder = () => { img.hidden = true; };
    img.addEventListener('error', esconder);
    if (img.complete && img.naturalWidth === 0) esconder();
  });
})();
