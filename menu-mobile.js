/* ==========================================================================
   MENU MOBILE (hambúrguer)
   ========================================================================== */
(function () {
  var header = document.querySelector('.navbar-amarela-oficial, .navbar, .topbar');
  var menu = document.querySelector('.menu');
  var actions = document.querySelector('.actions'); // Pega a área dos botões do topo

  // Se a página não tiver cabeçalho ou menu, não faz nada
  if (!header || !menu) return;

  // Botão hambúrguer
  var botao = document.createElement('button');
  botao.className = 'menu-toggle';
  botao.type = 'button';
  botao.setAttribute('aria-label', 'Abrir menu');
  botao.setAttribute('aria-expanded', 'false');
  botao.innerHTML = '<span></span><span></span><span></span>';

  // Painel com a cópia dos links do menu
  var painel = document.createElement('nav');
  painel.className = 'menu-mobile';
  painel.setAttribute('aria-label', 'Menu principal');
  
  // Insere os links de navegação principais
  var conteudoHtml = menu.innerHTML;

  // Se houver botões na barra de cima, seleciona e injeta de forma limpa no menu mobile
  if (actions) {
    var btnDoar = actions.querySelector('.btn-doar-nav');
    var btnAdotar = actions.querySelector('.btn-primary');
    var btnTutorial = actions.querySelector('.btn-como-funciona');

    var acoesMobileHtml = '<div class="menu-mobile-actions" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--border); padding-top: 15px;">';
    
    // Se o botão de tutorial existir no desktop, adiciona o equivalente funcional no mobile
    if (btnTutorial) {
      acoesMobileHtml += '<button type="button" onclick="const dt = document.getElementById(\'btn-tutorial\'); if(dt) dt.click();" class="btn-como-funciona-mobile" style="width: 100%; text-align: center; padding: 10px; background: rgba(26,54,93,0.05); border: 1px solid var(--primary); border-radius: 8px; font-weight: 600; color: var(--primary); cursor: pointer;">🐾 Como funciona o site?</button>';
    }
    if (btnDoar) acoesMobileHtml += btnDoar.outerHTML;
    if (btnAdotar) acoesMobileHtml += btnAdotar.outerHTML;

    acoesMobileHtml += '</div>';

    conteudoHtml += acoesMobileHtml;
  }

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

  // Clique no botão abre ou fecha
  botao.addEventListener('click', function () {
    if (painel.classList.contains('aberto')) {
      fechar();
    } else {
      abrir();
    }
  });

  // Clique em qualquer link ou botão do painel fecha o menu
  painel.addEventListener('click', function (e) {
    if (e.target.closest('a') || e.target.closest('button')) fechar();
  });

  // Tecla ESC fecha o menu
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') fechar();
  });

  // Clique fora do cabeçalho fecha o menu
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) fechar();
  });

  // Se a janela ficar grande, fecha o painel
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) fechar();
  });
})();