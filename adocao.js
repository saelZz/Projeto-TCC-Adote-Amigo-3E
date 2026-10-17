import { isDemoMode } from "./firebase-config.js";
import { fetchPets, fetchCitiesByState, formatAge } from "./pets-service.js";

const listEl = document.getElementById("pet-list");
const statusEl = document.getElementById("status");
const form = document.getElementById("filters");
const citySelect = form ? form.elements.city : null;

if (isDemoMode) {
  document.getElementById("demo-badge")?.removeAttribute("hidden");
}

/* ---------- PetCard: cria o HTML do card e do modal ---------- */
function PetCard(pet) {
  const li = document.createElement("li");
  li.className = "pet-card-wrapper";

  // Imagem e Foto do Pet
  const imageUrl = pet.photoURL || pet.photoUrl || "imagens/placeholder.jpg";

  // Identificação precisa do gênero (Macho vs Fêmea)
  const rawGender = (pet.gender || pet.genero || "").toString().toLowerCase().trim();
  const isMale = rawGender.includes("macho") || rawGender === "m";
  
  const genderText = isMale ? "Macho" : "Fêmea";
  const genderClass = isMale ? "pet-tag-male" : "pet-tag-female";
  const genderIcon = isMale ? "♂" : "♀";
  const genderColor = isMale ? "#0284c7" : "#e11d48";

  // Formatação do porte
  const rawSize = (pet.size || pet.porte || "médio").toString().toLowerCase();
  let sizeText = "Porte Médio";
  if (rawSize.includes("pequeno") || rawSize === "p") sizeText = "Porte Pequeno";
  if (rawSize.includes("grande") || rawSize === "g") sizeText = "Porte Grande";

  // Formatação de Espécie
  const rawSpecie = (pet.specie || pet.species || "Cachorro").toString().toLowerCase();
  const specieText = rawSpecie.includes("gato") ? "Gato" : "Cachorro";

  // Formatação da Idade (Aceita tanto string "Filhote" quanto número de meses)
  const ageDisplay = pet.age ? pet.age : (pet.ageMonths ? formatAge(pet.ageMonths) : "Idade não inf.");

  // Informações da ONG/Abrigo
  const ongName = pet.ongName || "Abrigo Parceiro";
  const ongLogo = pet.ongLogo || pet.logoUrl || "imagens/logo.png";

  li.innerHTML = `
    <!-- CARD PRINCIPAL -->
    <div class="pet-card">
      <div class="pet-card-image-wrapper">
        <img class="pet-card-img" src="${imageUrl}" alt="Foto de ${pet.name || 'Pet'}" loading="lazy" />
      </div>

      <div class="pet-body">
        <h2>${pet.name || 'Sem nome'}</h2>
        <p class="pet-meta">${pet.breed || 'SRD'} · ${pet.city || ''}/${pet.state || ''}</p>
        
        <div class="pet-tags-container">
          <span class="pet-tag">${specieText}</span>
          <span class="pet-tag">${ageDisplay}</span>
          ${pet.coatColor ? `<span class="pet-tag">${pet.coatColor}</span>` : ''}
          <span class="pet-tag ${genderClass}">${genderText}</span>
        </div>

        <div class="pet-shelter-block">
          <span class="shelter-label">Este pet pertence à Instituição:</span>
          <div class="shelter-logo-container" title="${ongName}">
            <img class="shelter-logo-centered" src="${ongLogo}" alt="${ongName}" />
          </div>
        </div>

        <a class="pet-btn desktop-btn" href="pet-detalhes.html?id=${encodeURIComponent(pet.id)}">
          Quero conhecer
        </a>
        <button class="pet-btn mobile-more-btn">Mais informações</button>
      </div>
    </div>

    <!-- OVERLAY & MODAL CENTRALIZADO -->
    <div class="pet-modal-overlay">
      <div class="pet-modal-container">
        <button type="button" class="modal-close-btn" aria-label="Fechar">&times;</button>
        
        <div class="modal-left-media">
          <img class="modal-full-img" src="${imageUrl}" alt="Foto de ${pet.name || 'Pet'}" />
        </div>

        <div class="modal-right-info">
          <span class="modal-ong-tag">${ongName.toUpperCase()}</span>
          <div class="modal-title-row">
            <h3>${pet.name || 'Sem nome'}</h3>
            <span class="modal-gender-icon" style="color: ${genderColor}">${genderIcon}</span>
          </div>

          <div class="modal-specs-grid">
            <div>
              <span class="spec-label">Peso</span>
              <strong class="spec-value">${pet.weight ? pet.weight + ' kg' : 'Não inf.'}</strong>
            </div>
            <div>
              <span class="spec-label">Idade aprox.</span>
              <strong class="spec-value">${ageDisplay}</strong>
            </div>
            <div>
              <span class="spec-label">Espécie</span>
              <strong class="spec-value">${specieText}</strong>
            </div>
            <div>
              <span class="spec-label">Porte</span>
              <strong class="spec-value">${sizeText}</strong>
            </div>
          </div>

          <div class="modal-detail-block">
            <span class="spec-label">Raça</span>
            <strong class="spec-value">${pet.breed || 'SRD'}</strong>
          </div>

          <div class="modal-detail-block">
            <span class="spec-label">Local</span>
            <strong class="spec-value">${pet.city || ''}, ${pet.state || ''}</strong>
          </div>

          <div class="modal-actions-row">
            <a class="pet-btn desktop-btn" href="pet-detalhes.html?id=${encodeURIComponent(pet.id)}">
              Quero conhecer
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Mapeamento de elementos
  const imageWrapper = li.querySelector(".pet-card-image-wrapper");
  const overlay = li.querySelector(".pet-modal-overlay");
  const closeBtn = li.querySelector(".modal-close-btn");
  const mobileBtn = li.querySelector(".mobile-more-btn");

  let hoverTimer = null;

  // --- CONTROLE DE TEMPO NO HOVER (EXATOS 3 SEGUNDOS) ---
  if (imageWrapper) {
    imageWrapper.addEventListener("mouseenter", () => {
      if (window.innerWidth > 768) {
        if (hoverTimer) clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => {
          overlay.classList.add("active");
        }, 3000); // 3000ms = 3 segundos
      }
    });

    imageWrapper.addEventListener("mouseleave", () => {
      if (hoverTimer) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
    });
  }

  // --- FECHAMENTO INSTANTÂNEO NO CLIQUE DO X OU FORA ---
  const closeModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    overlay.classList.remove("active");
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeModal(e);
      }
    });
  }

  // --- SUPORTE TECLA ESC PARA FECHAR ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay && overlay.classList.contains("active")) {
      closeModal();
    }
  });

  // --- MOBILE ---
  if (mobileBtn) {
    mobileBtn.addEventListener("click", () => {
      overlay.classList.add("active");
    });
  }

  return li;
}

/* ---------- PetList: estado da listagem + paginação ---------- */
const state = { filters: {}, cursor: null, hasMore: true, loading: false };

async function loadMore() {
  if (state.loading || !state.hasMore) return;
  state.loading = true;
  if (statusEl) statusEl.textContent = "Buscando amiguinhos...";
  
  try {
    const { pets, cursor, hasMore } = await fetchPets(state.filters, state.cursor);
    
    pets.forEach((pet) => listEl.appendChild(PetCard(pet)));
    state.cursor = cursor;
    state.hasMore = hasMore;

    // Remove preloader se existir
    const preloader = document.getElementById("preloader");
    if (preloader) preloader.classList.add("hidden");

    if (statusEl) {
      statusEl.textContent = listEl.children.length === 0
        ? "Nenhum amiguinho encontrado com esses filtros."
        : hasMore ? "" : "Você viu todos os pets disponíveis.";
    }
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.textContent = "Não foi possível carregar os pets. Tente novamente.";
    const preloader = document.getElementById("preloader");
    if (preloader) preloader.classList.add("hidden");
  } finally {
    state.loading = false;
  }
}

function resetList() {
  if (listEl) listEl.innerHTML = "";
  Object.assign(state, { cursor: null, hasMore: true });
  loadMore();
}

// Scroll infinito: carrega a próxima página quando o fim aparece
const sentinel = document.getElementById("sentinel");
if (sentinel) {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: "300px" }).observe(sentinel);
}

/* ---------- AdoptionFilters: reage às mudanças ---------- */
async function updateCities(uf) {
  if (!citySelect) return;
  citySelect.innerHTML = `<option value="">${uf ? "Todas" : "Escolha o estado"}</option>`;
  citySelect.disabled = !uf;
  const cities = await fetchCitiesByState(uf);
  cities.forEach((c) => citySelect.add(new Option(c, c)));
}

if (form) {
  form.addEventListener("change", async (e) => {
    if (e.target.name === "state") await updateCities(e.target.value);
    
    // Obtém todos os campos preenchidos no formulário de filtros
    const formData = new FormData(form);
    state.filters = Object.fromEntries(formData);
    
    resetList();
  });

  form.addEventListener("reset", () => {
    setTimeout(async () => {
      await updateCities("");
      state.filters = {};
      resetList();
    });
  });
}