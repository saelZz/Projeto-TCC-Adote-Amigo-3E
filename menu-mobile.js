/* ==========================================================================
   MENU MOBILE (hambúrguer) - Atualizado para incluir os botões de ação
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

  // Se houver botões na barra de cima, copia e injeta eles também no final do menu mobile
  if (actions) {
    conteudoHtml += '<div class="menu-mobile-actions" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--border); padding-top: 15px;">' + actions.innerHTML + '</div>';
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

  // Clique em qualquer link do painel fecha o menu
  painel.addEventListener('click', function (e) {
    if (e.target.closest('a')) fechar();
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