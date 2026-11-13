import { getPetById } from "./pets-service.js";

'use strict';

const $ = (selector) => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function formatWeight(rawWeight) {
  if (!rawWeight) return '';
  let weightStr = String(rawWeight).trim();
  if (/kg$/i.test(weightStr)) {
    return weightStr.toLowerCase();
  }
  return `${weightStr} kg`;
}

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

    // 1. Cabeçalho e Localização centralizados
    $('#pet-name-title').innerHTML = `${pet.name}<span class="name-dot">.</span>`;
    $('#pet-location').textContent = `${pet.city || ''}, ${pet.state || ''}`;

    // 2. Resumo Rápido
    const factsContainer = document.querySelector('.pet-summary .facts');
    if (factsContainer) {
      const rawWeight = pet.weight || pet.peso;
      const weightBadge = rawWeight ? `<span>${formatWeight(rawWeight)}</span>` : '';

      factsContainer.innerHTML = `
        ${pet.age ? `<span>${pet.age}</span>` : ''}
        ${pet.gender ? `<span>${pet.gender}</span>` : ''}
        ${pet.size ? `<span>${pet.size}</span>` : ''}
        ${weightBadge}
        ${pet.coatColor ? `<span>Pelagem ${pet.coatColor}</span>` : ''}
      `;
    }

    $('#pet-summary-title').textContent = `Um pequeno amor, um novo começo.`;
    $('#pet-summary-text').textContent = pet.shortDescription || pet.description || "Curioso, carinhoso e pronto para um novo começo.";

    const detailedDescEl = document.getElementById('pet-detailed-description');
    if (detailedDescEl) {
      detailedDescEl.textContent = pet.history || pet.description || "Este amiguinho é cheio de amor para dar e procura uma família responsável para chamar de sua.";
    }

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

    // 3. Fotos e Galeria Dinâmica
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
    
    // CORREÇÃO DAS ANIMAÇÕES: Força a exibição imediata dos blocos sem depender de Scroll/IntersectionObserver
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

  const playBtn = $('#play');
  if (playBtn) playBtn.style.display = 'none';

  let index = 0;
  let timer = null;

  // Atualiza os números do contador preservando os spans do HTML
  const numberEl = $('#photo-number');
  const totalEl = $('#photo-total');
  if (totalEl) {
    totalEl.textContent = String(photos.length).padStart(2, '0');
  }

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

    if (numberEl) {
      numberEl.textContent = String(index + 1).padStart(2, '0');
    }

    if ($('#photo-dialog img')) {
      $('#photo-dialog img').src = photos[index].src;
      $('#photo-dialog img').alt = photos[index].alt;
    }
  }

  function startAutoPlay() {
    clearInterval(timer);
    if (photos.length > 1 && !document.hidden) {
      timer = setInterval(() => {
        go(index + 1);
      }, 4500);
    }
  }

  function handleManualAction(targetIndex) {
    go(targetIndex);
    startAutoPlay();
  }

  if ($('#previous')) $('#previous').addEventListener('click', () => handleManualAction(index - 1));
  if ($('#next')) $('#next').addEventListener('click', () => handleManualAction(index + 1));
  
  document.querySelectorAll('.photo-thumbnail').forEach((button) => {
    button.addEventListener('click', () => handleManualAction(Number(button.dataset.photo)));
  });
  
  gallery.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { 
      event.preventDefault(); 
      handleManualAction(index + (event.key === 'ArrowRight' ? 1 : -1)); 
    }
  });

  // Touch Swipe no Mobile
  let startX = 0;
  gallery.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    if (touch) startX = touch.clientX;
  }, { passive: true });

  gallery.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    const diffX = touch.clientX - startX;
    if (Math.abs(diffX) > 40) {
      if (diffX < 0) {
        handleManualAction(index + 1);
      } else {
        handleManualAction(index - 1);
      }
    }
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(timer);
    else startAutoPlay();
  });

  if ($('#expand-photo')) {
    $('#expand-photo').addEventListener('click', () => { 
      clearInterval(timer); 
      $('#photo-dialog').showModal(); 
    });
  }

  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('close', () => startAutoPlay());
    dialog.addEventListener('cancel', () => startAutoPlay());
  });

  go(0);
  startAutoPlay();
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
  // Força todas as seções animadas a aparecerem visíveis e limpas imediatamente após o carregamento dos dados do pet
  document.querySelectorAll('.reveal').forEach((el) => {
    el.classList.add('is-visible');
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

initMenu();
initDialogs();
loadPetDetails();