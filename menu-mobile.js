/* ==========================================================================
   MENU MOBILE (hambúrguer) — Injeção garantida do menu e do mascote em todas as páginas
   ========================================================================== */
(function () {
  var header = document.querySelector('.navbar-amarela-oficial, .navbar, .topbar');
  var menu = document.querySelector('.menu');
  var actions = document.querySelector('.actions');

  if (!header || !menu) return;

  // Botão hambúrguer
  var botao = document.createElement('button');
  botao.className = 'menu-toggle';
  botao.type = 'button';
  botao.setAttribute('aria-label', 'Abrir menu');
  botao.setAttribute('aria-expanded', 'false');
  botao.innerHTML = '<span></span><span></span><span></span>';

  // Painel do menu mobile
  var painel = document.createElement('nav');
  painel.className = 'menu-mobile';
  painel.setAttribute('aria-label', 'Menu principal');
  
  var conteudoHtml = menu.innerHTML;

  // Bloco de ações do mobile com o botão do mascote e links principais garantidos
  var acoesMobileHtml = `
    <div class="menu-mobile-actions" style="margin-top: 15px; display: flex; flex-direction: column; gap: 12px; border-top: 1px solid var(--border, #dae2eb); padding-top: 15px;">
      <a href="como-funciona.html" class="btn-mascote-tutorial" style="display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 14px; background: var(--surface-soft, #f2f7fc); border: 1px solid var(--border, #dae2eb); border-radius: 14px; text-decoration: none; text-align: left; box-sizing: border-box;">
        <div class="mascote-avatar" style="position: relative; width: 40px; height: 40px; flex-shrink: 0;">
          <video autoplay loop muted playsinline class="mascote-img" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
            <source src="assets/logo-animada-como-funciona1.mp4" type="video/mp4">
          </video>
          <span class="pulse-ring" style="position: absolute; inset: -3px; border: 2px solid var(--primary, #0c3c75); border-radius: 50%; opacity: 0.6;"></span>
        </div>
        <div class="btn-texto-wrapper" style="display: flex; flex-direction: column;">
          <span class="btn-titulo" style="font-size: 13px; font-weight: 700; color: var(--primary, #0c3c75);">Como funciona o Adote Amigo?</span>
          <span class="btn-sub" style="font-size: 11px; color: var(--muted-foreground, #5f6a77);">Passo a passo da adoção</span>
        </div>
      </a>
  `;

  if (actions) {
    var btnDoar = actions.querySelector('.btn-doar-nav');
    var btnAdotar = actions.querySelector('.btn-primary');

    if (btnDoar) acoesMobileHtml += btnDoar.outerHTML;
    if (btnAdotar) acoesMobileHtml += btnAdotar.outerHTML;
  } else {
    // Fallback caso a barra de ações não exista na página
    acoesMobileHtml += `
      <a href="doe.html" class="btn-doar-nav" style="text-align: center; padding: 12px; border-radius: 50px; background: #10b981; color: #fff; font-weight: 700; text-decoration: none;">Apoiar instituições</a>
      <a href="adotar.html" class="btn btn-primary" style="text-align: center; padding: 12px; border-radius: 50px; background: #0c3c75; color: #fff; font-weight: 700; text-decoration: none;">Quero adotar</a>
    `;
  }

  acoesMobileHtml += '</div>';
  conteudoHtml += acoesMobileHtml;

  painel.innerHTML = conteudoHtml;

  header.appendChild(botao);
  header.appendChild(painel);

  function abrir() {
    painel.classList.add('aberto');
    botao.setAttribute('aria-expanded', 'true');
    botao.setAttribute('aria-label', 'Fechar menu');
  }

  function fechar() {
    painel.classList.remove('aberto');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
  }

  botao.addEventListener('click', function () {
    if (painel.classList.contains('aberto')) {
      fechar();
    } else {
      abrir();
    }
  });

  painel.addEventListener('click', function (e) {
    if (e.target.closest('a') || e.target.closest('button')) fechar();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fechar();
  });

  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) fechar();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) fechar();
  });
})();