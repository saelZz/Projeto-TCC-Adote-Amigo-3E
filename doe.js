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

  /* 2) Menu das instituições: cada nome abre e fecha a sua caixa de botões */
  function definirAberto(card, aberto) {
    const botao = card.querySelector('.doe-ong-trigger');
    card.classList.toggle('is-open', aberto);
    botao?.setAttribute('aria-expanded', String(aberto));
  }

  document.querySelectorAll('.doe-ong-trigger').forEach((botao) => {
    botao.addEventListener('click', () => {
      const card = botao.closest('.doe-ong');
      if (!card) return;
      const vaiAbrir = !card.classList.contains('is-open');
      document.querySelectorAll('.doe-ong.is-open').forEach((aberto) => definirAberto(aberto, false));
      definirAberto(card, vaiAbrir);
    });
  });

  /* 3) Endereço direto para uma instituição, por exemplo doe.html#caramelo, já deixa a caixa aberta */
  function abrirPeloEndereco() {
    const id = decodeURIComponent(window.location.hash.replace('#', ''));
    if (!id) return;
    const card = document.getElementById(id);
    if (!card || !card.classList.contains('doe-ong')) return;
    document.querySelectorAll('.doe-ong.is-open').forEach((aberto) => definirAberto(aberto, false));
    definirAberto(card, true);
  }
  abrirPeloEndereco();
  window.addEventListener('hashchange', abrirPeloEndereco);

  /* 4) Se um logotipo não carregar, esconde a imagem e mostra a letra inicial */
  document.querySelectorAll('.doe-ong-logo img').forEach((img) => {
    const esconder = () => { img.hidden = true; };
    img.addEventListener('error', esconder);
    if (img.complete && img.naturalWidth === 0) esconder();
  });
})();
