(() => {
  'use strict';

  const EMAIL_DESTINO = 'adoteamigo.tcc2026@gmail.com';

  /* ENVIO DIRETO DA MENSAGEM
     Cole aqui o endereço do formulário criado no Formspree (formspree.io), no formato
     'https://formspree.io/f/xxxxxxxx'. Com ele preenchido, a mensagem chega no e-mail da conta
     do Formspree sem abrir nenhum aplicativo. Se ficar vazio, o formulário abre o aplicativo
     de e-mail da pessoa com a mensagem pronta (modo antigo). */
  const FORM_ENDPOINT = 'https://formspree.io/f/xoejrgyw';

  /* ------------------------------------------------------------------
     1) Animação de entrada ao rolar a página (igual à página Quem Somos)
     ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------
     2) Botão "Copiar e-mail"
     ------------------------------------------------------------------ */
  const botaoCopiar = document.querySelector('#copiar-email');
  const msgCopiar = document.querySelector('#copiar-msg');

  botaoCopiar?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_DESTINO);
      msgCopiar.textContent = 'E-mail copiado!';
    } catch (erro) {
      msgCopiar.textContent = 'Não foi possível copiar. O e-mail é ' + EMAIL_DESTINO;
    }
  });

  /* ------------------------------------------------------------------
     2.1) Menu das instituições: cada nome abre e fecha a sua caixa de contato
     ------------------------------------------------------------------ */
  document.querySelectorAll('.ong-trigger').forEach((botao) => {
    botao.addEventListener('click', () => {
      const card = botao.closest('.ong-card');
      if (!card) return;
      const vaiAbrir = !card.classList.contains('is-open');
      document.querySelectorAll('.ong-card.is-open').forEach((aberto) => {
        aberto.classList.remove('is-open');
        aberto.querySelector('.ong-trigger')?.setAttribute('aria-expanded', 'false');
      });
      card.classList.toggle('is-open', vaiAbrir);
      botao.setAttribute('aria-expanded', String(vaiAbrir));
    });
  });

  // Se o logotipo não carregar (arquivo ausente), esconde a imagem e mostra a letra inicial
  document.querySelectorAll('.ong-logo img').forEach((img) => {
    const esconder = () => { img.hidden = true; };
    img.addEventListener('error', esconder);
    if (img.complete && img.naturalWidth === 0) esconder();
  });

  /* ------------------------------------------------------------------
     3) Formulário
     O site é estático (GitHub Pages), então não há servidor para enviar a mensagem.
     Ao enviar, abrimos o aplicativo de e-mail do usuário com tudo preenchido.
     ------------------------------------------------------------------ */
  const form = document.querySelector('#form-contato');
  const status = document.querySelector('#form-status');
  const campoAssunto = document.querySelector('#assunto');

  const campos = {
    nome: {
      el: document.querySelector('#nome'),
      erro: document.querySelector('#erro-nome'),
      valida: (v) => v.trim().length >= 2 || 'Informe o seu nome.'
    },
    email: {
      el: document.querySelector('#email'),
      erro: document.querySelector('#erro-email'),
      valida: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Informe um e-mail válido, como nome@exemplo.com.'
    },
    assunto: {
      el: campoAssunto,
      erro: document.querySelector('#erro-assunto'),
      valida: (v) => v !== '' || 'Selecione um assunto.'
    },
    mensagem: {
      el: document.querySelector('#mensagem'),
      erro: document.querySelector('#erro-mensagem'),
      valida: (v) => v.trim().length >= 10 || 'Escreva uma mensagem com pelo menos 10 caracteres.'
    }
  };

  function validarCampo(campo) {
    const resultado = campo.valida(campo.el.value);
    const ok = resultado === true;
    campo.erro.textContent = ok ? '' : resultado;
    campo.el.closest('.field').dataset.invalid = String(!ok);
    campo.el.setAttribute('aria-invalid', String(!ok));
    return ok;
  }

  function mostrarStatus(texto, tipo) {
    status.textContent = texto;
    status.classList.remove('is-ok', 'is-error');
    if (tipo) status.classList.add(tipo === 'ok' ? 'is-ok' : 'is-error');
  }

  if (form) {
    // O aviso abaixo do botão precisa descrever o que realmente acontece
    const avisoForm = form.querySelector('.form-note');
    if (FORM_ENDPOINT && avisoForm) {
      avisoForm.textContent = 'Ao enviar, a sua mensagem é entregue diretamente à equipe do Adote Amigo por meio de um serviço de formulários.';
    }

    // Depois que o campo foi marcado com erro, corrige a mensagem enquanto a pessoa digita
    Object.values(campos).forEach((campo) => {
      campo.el.addEventListener('input', () => {
        if (campo.el.closest('.field').dataset.invalid === 'true') validarCampo(campo);
      });
      campo.el.addEventListener('change', () => {
        if (campo.el.closest('.field').dataset.invalid === 'true') validarCampo(campo);
      });
    });

    form.addEventListener('submit', async (evento) => {
      evento.preventDefault();

      const resultados = Object.values(campos).map(validarCampo);
      if (resultados.includes(false)) {
        const primeiroComErro = Object.values(campos).find((c) => c.el.getAttribute('aria-invalid') === 'true');
        primeiroComErro?.el.focus();
        mostrarStatus('Revise os campos destacados e tente novamente.', 'erro');
        return;
      }

      const nome = campos.nome.el.value.trim();
      const email = campos.email.el.value.trim();
      const mensagem = campos.mensagem.el.value.trim();
      const assuntoTexto = campoAssunto.options[campoAssunto.selectedIndex].text;

      const titulo = 'Adote Amigo — ' + assuntoTexto;
      const corpo = 'Nome: ' + nome + '\nE-mail para resposta: ' + email + '\n\nMensagem:\n' + mensagem;

      // Modo 1: envio direto pelo Formspree (quando FORM_ENDPOINT está preenchido)
      if (FORM_ENDPOINT) {
        const botaoEnviar = form.querySelector('button[type="submit"]');
        botaoEnviar.disabled = true;
        mostrarStatus('Enviando a sua mensagem...', null);

        try {
          const dados = new FormData(form);
          dados.set('assunto', assuntoTexto);
          dados.set('_subject', titulo);

          const resposta = await fetch(FORM_ENDPOINT, {
            method: 'POST',
            body: dados,
            headers: { Accept: 'application/json' }
          });

          if (resposta.ok) {
            form.reset();
            mostrarStatus('Mensagem enviada com sucesso. Obrigado por entrar em contato!', 'ok');
          } else {
            mostrarStatus(
              'Não foi possível enviar agora. Tente novamente ou escreva para ' + EMAIL_DESTINO + '.',
              'erro'
            );
          }
        } catch (erro) {
          mostrarStatus(
            'Não foi possível enviar: verifique a sua conexão. Você também pode escrever para ' + EMAIL_DESTINO + '.',
            'erro'
          );
        } finally {
          botaoEnviar.disabled = false;
        }
        return;
      }

      // Modo 2: sem endpoint, abre o aplicativo de e-mail com a mensagem pronta
      mostrarStatus(
        'Abrimos o seu aplicativo de e-mail com a mensagem pronta. Confirme o envio por lá. ' +
        'Se nada abrir, escreva para ' + EMAIL_DESTINO + '.',
        'ok'
      );

      window.location.href =
        'mailto:' + EMAIL_DESTINO +
        '?subject=' + encodeURIComponent(titulo) +
        '&body=' + encodeURIComponent(corpo);
    });
  }
})();
