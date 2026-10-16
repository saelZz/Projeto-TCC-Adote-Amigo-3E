/* Adote Amigo — interações independentes, sem dependências nem conexão com Firebase. */
'use strict';
// Dados demonstrativos: substituir pelas informações confirmadas da ONG.
// Sem URL inventada: enquanto falta o link real, o botão informa o visitante.
const shelter = { name: 'Abrigo responsável', officialUrl: null };
const $ = (selector) => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function initOfficialLinks() {
  // Apenas HTTPS. Um link ausente ou inválido nunca envia a um site fictício.
  let url;
  try { const candidate = new URL(shelter.officialUrl); if (candidate.protocol === 'https:') url = candidate.href; } catch { /* Informação ainda não fornecida. */ }
  $('#shelter-name').textContent = shelter.name;
  document.querySelectorAll('.official-link').forEach((link) => {
    if (url) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Conhecer Safira no site oficial do abrigo (abre em nova aba)');
    } else {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        $('#link-dialog').showModal();
      });
    }
  });
}

function initGallery() {
  const gallery = $('.photo-gallery');
  const photos = [...gallery.querySelectorAll('.pet-photo')];
  const play = $('#play');
  let index = 0, timer, playing = false, hovering = false;
  function go(nextIndex) {
    index = (nextIndex + photos.length) % photos.length;
    photos.forEach((photo, n) => {
      photo.classList.toggle('is-active', n === index);
      photo.setAttribute('aria-hidden', String(n !== index));
    });
    document.querySelectorAll('.photo-thumbnail').forEach((button) => {
      const selected = Number(button.dataset.photo) === index;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    $('#photo-number').textContent = String(index + 1).padStart(2, '0');
    $('#photo-dialog img').src = photos[index].src;
    $('#photo-dialog img').alt = photos[index].alt;
  }
  function schedule() {
    clearInterval(timer);
    if (playing && !hovering && !document.hidden && !reducedMotion.matches && !$('.pet-stage').contains(document.activeElement) && !document.querySelector('dialog[open]')) {
      timer = setInterval(() => go(index + 1), 7000);
    }
  }
  function setPlaying(value) {
    playing = value;
    play.setAttribute('aria-pressed', String(value));
    play.setAttribute('aria-label', value ? 'Pausar troca automática' : 'Iniciar troca automática');
    play.innerHTML = value ? '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 5 10 7-10 7Z"/></svg>';
    schedule();
  }
  // Troca automática opcional: nenhum movimento automático imposto.
  $('#previous').addEventListener('click', () => { go(index - 1); schedule(); });
  $('#next').addEventListener('click', () => { go(index + 1); schedule(); });
  document.querySelectorAll('.photo-thumbnail').forEach((button) => {
    button.addEventListener('click', () => { go(Number(button.dataset.photo)); schedule(); });
  });
  play.addEventListener('click', () => setPlaying(!playing));
  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); go(index + (event.key === 'ArrowRight' ? 1 : -1)); schedule(); }
  });
  let start;
  gallery.addEventListener('touchstart', (event) => { const touch = event.touches[0]; start = touch ? { x: touch.clientX, y: touch.clientY } : undefined; }, { passive: true });
  gallery.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const dx = touch.clientX - start.x, dy = touch.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { go(index + (dx < 0 ? 1 : -1)); schedule(); }
    start = undefined;
  }, { passive: true });
  const stage = $('.pet-stage');
  stage.addEventListener('pointerenter', () => { hovering = true; schedule(); });
  stage.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  stage.addEventListener('focusin', schedule);
  stage.addEventListener('focusout', () => setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) setPlaying(false); });
  $('#expand-photo').addEventListener('click', () => { clearInterval(timer); $('#photo-dialog').showModal(); });
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('close', schedule);
    dialog.addEventListener('cancel', schedule);
  });
  go(0);
}

function initMenu() {
  const button = $('.mobile-toggle'), menu = $('#menu-principal');
  const setOpen = (open) => { menu.classList.toggle('open', open); button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação'); };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setOpen(false); button.focus(); } });
  document.addEventListener('click', (event) => { if (!event.target.closest('.navbar')) setOpen(false); });
  matchMedia('(max-width: 760px)').addEventListener('change', () => setOpen(false));
}

function initDialogs() {
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
  });
}

function initReveal() {
  if (reducedMotion.matches || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: .1 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}
initOfficialLinks(); initGallery(); initMenu(); initDialogs(); initReveal();