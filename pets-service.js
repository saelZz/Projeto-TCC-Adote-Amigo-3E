/**
 * ============================================================
 *  Adote Amigo — Serviço de Pets e ONGs
 *  Com busca integrada à coleção de ONGs do Firestore.
 * ============================================================
 */
import {
  collection, query, where, limit, startAfter,
  getDocs, getDoc, doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, isDemoMode } from "./firebase-config.js";
import { DEMO_PETS, DEMO_ONGS } from "./demo-data.js";

export const PAGE_SIZE = 12;

/** Converte e normaliza um documento do Firestore de acordo com o schema */
const toObject = (snap) => {
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    name: data.name || data.nome || "Pet sem nome",
    specie: data.specie || data.species || data.especie || "Cachorro",
    breed: data.breed || data.raca || "SRD",
    age: data.age || "Idade não inf.",
    ageMonths: data.ageMonths !== undefined ? data.ageMonths : (data.idade_meses || 0),
    size: data.size || data.porte || "Médio",
    coatColor: data.coatColor || data.pelagem || "",
    city: data.city || data.cidade || "",
    state: data.state || data.estado || "",
    photoUrl: data.photoURL || data.photoUrl || data.imagem || "imagens/logo.png",
    status: data.status || "Disponivel",
    createdAt: data.createdAt || new Date(),
    gender: data.gender || data.genero || "Macho",
    weight: data.weight || null,
    ongId: data.ongId || ""
  };
};

/** Formata idade em meses para texto amigável (Fallback) */
export function formatAge(months) {
  if (!months) return "Idade não inf.";
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "ano" : "anos"}`;
}

/**
 * Busca pets disponíveis e aplica os filtros selecionados,
 * injetando também os dados da ONG parceira correspondente.
 */
export async function fetchPets(filters = {}, cursor = null) {
  if (isDemoMode) return fetchDemoPets(filters, cursor);

  // Busca pets com status Disponivel no Firestore
  const constraints = [where("status", "==", "Disponivel")];
  
  if (cursor) constraints.push(startAfter(cursor));

  try {
    const snap = await getDocs(query(collection(db, "pets"), ...constraints));
    let pets = snap.docs.map(toObject);

    // Filtragem local resiliente para evitar erros de índice composto no Firestore
    if (filters.specie) pets = pets.filter(p => p.specie === filters.specie);
    if (filters.species) pets = pets.filter(p => p.specie === filters.species);
    if (filters.size) pets = pets.filter(p => p.size === filters.size);
    if (filters.age) pets = pets.filter(p => p.age === filters.age);
    if (filters.ongId) pets = pets.filter(p => p.ongId === filters.ongId);
    if (filters.coatColor) pets = pets.filter(p => p.coatColor === filters.coatColor);
    if (filters.state) pets = pets.filter(p => p.state === filters.state);
    if (filters.city) pets = pets.filter(p => p.city === filters.city);

    // Paginação simples dos resultados filtrados
    const paginatedPets = pets.slice(0, PAGE_SIZE);

    // Enriquece cada pet com os dados reais da ONG parceira
    for (let pet of paginatedPets) {
      if (pet.ongId) {
        try {
          const ongSnap = await getDoc(doc(db, "ongs", pet.ongId));
          if (ongSnap.exists()) {
            const ongData = ongSnap.data();
            pet.ongName = ongData.name || ongData.name1 || "Abrigo Parceiro";
            pet.ongLogo = ongData.logoUrl || "imagens/logo.png";
          } else {
            pet.ongName = "Abrigo Parceiro";
            pet.ongLogo = "imagens/logo.png";
          }
        } catch (e) {
          pet.ongName = "Abrigo Parceiro";
          pet.ongLogo = "imagens/logo.png";
        }
      } else {
        pet.ongName = "Abrigo Parceiro";
        pet.ongLogo = "imagens/logo.png";
      }
    }

    return {
      pets: paginatedPets,
      cursor: snap.docs[snap.docs.length - 1] ?? null,
      hasMore: pets.length > PAGE_SIZE,
    };
  } catch (error) {
    console.error("Erro ao buscar pets no Firestore:", error);
    return { pets: [], cursor: null, hasMore: false };
  }
}

/** Busca um pet específico pelo ID com os dados da ONG */
export async function getPetById(id) {
  if (isDemoMode) return DEMO_PETS.find((p) => p.id === id) ?? null;
  const snap = await getDoc(doc(db, "pets", id));
  if (!snap.exists()) return null;
  
  const pet = toObject(snap);
  if (pet.ongId) {
    try {
      const ongSnap = await getDoc(doc(db, "ongs", pet.ongId));
      if (ongSnap.exists()) {
        const ongData = ongSnap.data();
        pet.ongName = ongData.name || ongData.name1 || "Abrigo Parceiro";
        pet.ongLogo = ongData.logoUrl || "imagens/logo.png";
      }
    } catch (e) {
      pet.ongName = "Abrigo Parceiro";
      pet.ongLogo = "imagens/logo.png";
    }
  }
  return pet;
}

/** Lista ONGs cadastradas */
export async function fetchOngs(state = "") {
  if (isDemoMode) return DEMO_ONGS.filter((o) => !state || o.state === state);
  const constraints = [where("verified", "==", true)];
  if (state) constraints.push(where("state", "==", state));
  const snap = await getDocs(query(collection(db, "ongs"), ...constraints));
  return snap.docs.map(toObject);
}

/** Busca uma ONG pelo ID */
export async function getOngById(id) {
  if (isDemoMode) return DEMO_ONGS.find((o) => o.id === id) ?? null;
  const snap = await getDoc(doc(db, "ongs", id));
  return snap.exists() ? toObject(snap) : null;
}

/** Cidades disponíveis de um estado */
export async function fetchCitiesByState(state) {
  if (!state) return [];
  if (isDemoMode) {
    const source = DEMO_PETS.filter((p) => p.state === state);
    return [...new Set(source.map((p) => p.city))].filter(Boolean).sort();
  }

  try {
    const snap = await getDocs(
      query(
        collection(db, "pets"),
        where("state", "==", state),
        where("status", "==", "Disponivel")
      )
    );
    const source = snap.docs.map((d) => d.data());
    return [...new Set(source.map((p) => p.city || p.cidade))].filter(Boolean).sort();
  } catch (error) {
    console.error("Erro ao carregar cidades:", error);
    return [];
  }
}

function fetchDemoPets(filters, cursor) {
  const list = DEMO_PETS.filter((p) =>
    (!filters.specie || p.specie === filters.specie) &&
    (!filters.size || p.size === filters.size) &&
    (!filters.state || p.state === filters.state) &&
    (!filters.city || p.city === filters.city));
  const start = cursor ?? 0;
  const end = start + PAGE_SIZE;
  return Promise.resolve({ pets: list.slice(start, end), cursor: end, hasMore: end < list.length });
}