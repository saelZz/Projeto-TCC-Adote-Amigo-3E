import { getPetById } from "./pets-service.js";

'use strict';

const $ = (selector) => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

async function loadPetDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const petId = urlParams.get('id');
  const preloader = document.getElementById("preloader");

  if (!petId) {
    alert("Nenhum pet selecionado!");
    window.location.href = "adotar.html";
    return;
  }

  try {
    const pet = await getPetById(petId);

    if (!pet) {
      alert("Ops! Este amiguinho não foi encontrado ou já foi adotado.");
      window.location.href = "adotar.html";
      return;
    }
    
    document.title = `Conheça ${pet.name} — Adote Amigo`;

    // 1. Cabeçalho e Localização
    $('#pet-name-title').innerHTML = `${pet.name}<span class="name-dot">.</span>`;
    $('#pet-location').textContent = `${pet.city || ''}, ${pet.state || ''}`;

    // 2. Resumo Rápido (Fatos)
    const factsContainer = document.querySelector('.pet-summary .facts');
    if (factsContainer) {
      // Verifica se o peso existe no Firebase
      const weightBadge = (pet.weight || pet.peso) ? `<span>${pet.weight || pet.peso}</span>` : '';

      factsContainer.innerHTML = `
        ${pet.age ? `<span>${pet.age}</span>` : ''}
        ${pet.gender ? `<span>${pet.gender}</span>` : ''}
        ${pet.size ? `<span>${pet.size}</span>` : ''}
        ${weightBadge}
        ${pet.coatColor ? `<span>Pelagem ${pet.coatColor}</span>` : ''}
      `;
    }

    // 3. Títulos e Descrições Curtas
    $('#pet-summary-title').textContent = `Um pequeno amor, um novo começo.`;
    $('#pet-summary-text').textContent = pet.shortDescription || pet.description || "Curioso, carinhoso e pronto para um novo começo.";

    // Segunda Mensagem (História Completa vinda do campo history do Firebase)
    const detailedDescEl = document.getElementById('pet-detailed-description');
    if (detailedDescEl) {
      detailedDescEl.textContent = pet.history || pet.description || "Este amiguinho é cheio de amor para dar e procura uma família responsável para chamar de sua.";
    }

    // 4. Dados da ONG e Logo no lugar da casinha
    const ongName = pet.ongName || "Abrigo responsável";
    const ongLogo = pet.ongLogo || "imagens/logo.png";
    
    $('#shelter-name').textContent = ongName;

    const shelterSymbolContainer = document.querySelector('.shelter-symbol');
    if (shelterSymbolContainer) {
      shelterSymbolContainer.innerHTML = `<img src="${ongLogo}" alt="Logo de ${ongName}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%; padding: 2px;">`;
      shelterSymbolContainer.style.border = "none";
      shelterSymbolContainer.style.background = "transparent";
    }

    initOfficialLinks(ongName, pet.ongUrl || null);

    // 5. Fotos e Galeria Dinâmica (Puxa o array gallery do Firebase)
    const mainPhotoUrl = pet.photoUrl || "imagens/logo.png";
    const galleryEl = $('.photo-gallery');
    const thumbnailsEl = $('.photo-thumbnails');
    
    const photosArray = (pet.gallery && pet.gallery.length > 0) ? pet.gallery : [mainPhotoUrl];

    galleryEl.innerHTML = photosArray.map((imgSrc, idx) => `
      <img class="pet-photo ${idx === 0 ? 'is-active' : ''}" src="${imgSrc}" alt="Foto de ${pet.name}" width="1024" height="768" ${idx !== 0 ? 'aria-hidden="true"' : ''}>
    `).join('');

    thumbnailsEl.innerHTML = photosArray.map((imgSrc, idx) => `
      <button class="photo-thumbnail ${idx === 0 ? 'is-selected' : ''}" data-photo="${idx}" aria-label="Ver foto ${idx + 1}" aria-pressed="${idx === 0}">
        <img src="${imgSrc}" alt="" width="64" height="48">
      </button>
    `).join('');

    initGallery();
    initDialogs();
    initReveal();

    if (preloader) preloader.classList.add("hidden");

  } catch (err) {
    console.error("Erro ao carregar detalhes do pet:", err);
    if (preloader) preloader.classList.add("hidden");
    alert("Não foi possível carregar as informações deste pet.");
  }
}

function initOfficialLinks(shelterName, officialUrl) {
  let url;
  try { 
    const candidate = new URL(officialUrl); 
    if (candidate.protocol === 'https:') url = candidate.href; 
  } catch { /* Link não fornecido */ }

  document.querySelectorAll('.official-link').forEach((link) => {
    if (url) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `Conhecer no site oficial de ${shelterName} (abre em nova aba)`);
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
  if (photos.length === 0) return;

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

    // Atualização dinâmica e correta do contador (ex: 01 / 01 ou 01 / 04)
    const counterEl = $('.photo-counter');
    if (counterEl) {
      const currentStr = String(index + 1).padStart(2, '0');
      const totalStr = String(photos.length).padStart(2, '0');
      counterEl.innerHTML = `<b id="photo-number">${currentStr}</b><span aria-hidden="true"> / </span>${totalStr}`;
    }

    if ($('#photo-dialog img')) {
      $('#photo-dialog img').src = photos[index].src;
      $('#photo-dialog img').alt = photos[index].alt;
    }
  }

  function schedule() {
    clearInterval(timer);
    if (playing && !hovering && !document.hidden && !reducedMotion.matches && !$('.pet-stage').contains(document.activeElement) && !document.querySelector('dialog[open]')) {
      timer = setInterval(() => go(index + 1), 7000);
    }
  }

  function setPlaying(value) {
    playing = value;
    if (play) {
      play.setAttribute('aria-pressed', String(value));
      play.setAttribute('aria-label', value ? 'Pausar troca automática' : 'Iniciar troca automática');
      play.innerHTML = value ? '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 5 10 7-10 7Z"/></svg>';
    }
    schedule();
  }

  if ($('#previous')) $('#previous').addEventListener('click', () => { go(index - 1); schedule(); });
  if ($('#next')) $('#next').addEventListener('click', () => { go(index + 1); schedule(); });
  
  document.querySelectorAll('.photo-thumbnail').forEach((button) => {
    button.addEventListener('click', () => { go(Number(button.dataset.photo)); schedule(); });
  });

  if (play) play.addEventListener('click', () => setPlaying(!playing));
  
  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { 
      event.preventDefault(); 
      go(index + (event.key === 'ArrowRight' ? 1 : -1)); 
      schedule(); 
    }
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
  if (stage) {
    stage.addEventListener('pointerenter', () => { hovering = true; schedule(); });
    stage.addEventListener('pointerleave', () => { hovering = false; schedule(); });
    stage.addEventListener('focusin', schedule);
    stage.addEventListener('focusout', () => setTimeout(schedule, 0));
  }

  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) setPlaying(false); });
  
  if ($('#expand-photo')) {
    $('#expand-photo').addEventListener('click', () => { 
      clearInterval(timer); 
      $('#photo-dialog').showModal(); 
    });
  }

  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('close', schedule);
    dialog.addEventListener('cancel', schedule);
  });

  go(0);
}

function initMenu() {
  const button = $('.mobile-toggle'), menu = $('#menu-principal');
  if (!button || !menu) return;
  const setOpen = (open) => { menu.classList.toggle('open', open); button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open ? 'Fechar navegação' : 'Abrir navegação'); };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setOpen(false); button.focus(); } });
  document.addEventListener('click', (event) => { if (!event.target.closest('.navbar')) setOpen(false); });
  matchMedia('(max-width: 760px)').addEventListener('change', () => setOpen(false));
}

function initDialogs() {
  document.querySelectorAll('dialog').forEach((dialog) => {
    const closeBtn = dialog.querySelector('.dialog-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => dialog.close());
    }
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

loadPetDetails();
initMenu();
initDialogs();