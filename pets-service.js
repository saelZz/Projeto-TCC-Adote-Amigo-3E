/**
 * ============================================================
 *  Adote Amigo — Serviço de Pets e ONGs
 *  Com busca integrada à coleção de ONGs do Firestore.
 * ============================================================
 */
import {
  collection, query, where, orderBy, limit, startAfter,
  getDocs, getDoc, doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db, isDemoMode } from "./firebase-config.js";
import { DEMO_PETS, DEMO_ONGS } from "./demo-data.js";

export const PAGE_SIZE = 12;

/** Converte e normaliza um documento do Firestore */
const toObject = (snap) => {
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    name: data.name || data.nome || "Pet sem nome",
    species: data.species || data.especie || "cachorro",
    breed: data.breed || data.raca || "SRD",
    ageMonths: data.ageMonths !== undefined ? data.ageMonths : (data.idade_meses || 0),
    size: data.size || data.porte || "medio",
    city: data.city || data.cidade || "",
    state: data.state || data.estado || "",
    photoUrl: data.photoUrl || data.photoURL || data.imagem || "imagens/logo.png",
    status: data.status || "disponivel",
    createdAt: data.createdAt || new Date(),
    gender: data.gender || data.genero || "Macho",
    ongId: data.ongId || ""
  };
};

/** Formata idade em meses para texto amigável */
export function formatAge(months) {
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "ano" : "anos"}`;
}

/**
 * Busca pets disponíveis e injeta os dados reais da ONG correspondente.
 */
export async function fetchPets(filters = {}, cursor = null) {
  if (isDemoMode) return fetchDemoPets(filters, cursor);

  const constraints = [where("status", "==", "disponivel")];
  if (filters.species) constraints.push(where("species", "==", filters.species));
  if (filters.size) constraints.push(where("size", "==", filters.size));
  if (filters.state) constraints.push(where("state", "==", filters.state));
  if (filters.city) constraints.push(where("city", "==", filters.city));
  constraints.push(limit(PAGE_SIZE + 1));
  if (cursor) constraints.push(startAfter(cursor));

  const snap = await getDocs(query(collection(db, "pets"), ...constraints));
  const docs = snap.docs.slice(0, PAGE_SIZE);
  
  const pets = docs.map(toObject);

  // Busca os dados da ONG para cada pet de forma otimizada
  for (let pet of pets) {
    if (pet.ongId) {
      try {
        const ongSnap = await getDoc(doc(db, "ongs", pet.ongId));
        if (ongSnap.exists()) {
          const ongData = ongSnap.data();
          // Mapeia considerando que no seu banco está como 'name1' e 'logoUrl'
          pet.ongName = ongData.name1 || ongData.name || "Abrigo Parceiro";
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
    pets,
    cursor: docs[docs.length - 1] ?? null,
    hasMore: snap.docs.length > PAGE_SIZE,
  };
}

/** Busca um pet específico pelo id com dados da ONG */
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
        pet.ongName = ongData.name1 || ongData.name || "Abrigo Parceiro";
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

/** Busca uma ONG pelo id */
export async function getOngById(id) {
  if (isDemoMode) return DEMO_ONGS.find((o) => o.id === id) ?? null;
  const snap = await getDoc(doc(db, "ongs", id));
  return snap.exists() ? toObject(snap) : null;
}

/** Cidades disponíveis de um estado */
export async function fetchCitiesByState(state) {
  if (!state) return [];
  const source = isDemoMode
    ? DEMO_PETS.filter((p) => p.state === state)
    : (await getDocs(query(collection(db, "pets"),
        where("state", "==", state), where("status", "==", "disponivel")))).docs.map((d) => d.data());
  return [...new Set(source.map((p) => p.city || p.cidade))].filter(Boolean).sort();
}

function fetchDemoPets(filters, cursor) {
  const list = DEMO_PETS.filter((p) =>
    (!filters.species || p.species === filters.species) &&
    (!filters.size || p.size === filters.size) &&
    (!filters.state || p.state === filters.state) &&
    (!filters.city || p.city === filters.city));
  const start = cursor ?? 0;
  const end = start + PAGE_SIZE;
  return Promise.resolve({ pets: list.slice(start, end), cursor: end, hasMore: end < list.length });
}