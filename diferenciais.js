/* ==========================================================================
   SCRIPT DOS DIFERENCIAIS: Garantia total de Scroll Reveal + Acordeão
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const section = document.querySelector(".aa-differences");
  const cards = document.querySelectorAll(".aa-card");

  if (!section || !cards.length) return;

  // 1. Ativa a animação de scroll (Intersection Observer robusto)
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.documentElement.classList.add("aa-enabled", "aa-section-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(section);
  } else {
    // Fallback caso o navegador seja antigo
    document.documentElement.classList.add("aa-enabled", "aa-section-visible");
  }

  // 2. Interatividade de Clique ("Abrir a paginazinha interna" no card)
  cards.forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", "false");

    // Evita duplicar se o script rodar mais de uma vez
    if (card.querySelector(".aa-card-details")) return;

    const detailsText = getDetailsForCard(card);
    const detailsBox = document.createElement("div");
    detailsBox.className = "aa-card-details";
    detailsBox.innerHTML = `<p>${detailsText}</p><span class="aa-close-hint">Clique novamente para recolher ✕</span>`;
    card.appendChild(detailsBox);

    const toggleCard = (e) => {
      if (e.target.tagName === "A") return;
      
      const isOpen = card.classList.contains("aa-expanded");
      
      cards.forEach((c) => {
        c.classList.remove("aa-expanded");
        c.setAttribute("aria-expanded", "false");
      });

      if (!isOpen) {
        card.classList.add("aa-expanded");
        card.setAttribute("aria-expanded", "true");
      }
    };

    card.addEventListener("click", toggleCard);
    
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCard(e);
      }
    });
  });

  function getDetailsForCard(card) {
    const title = card.querySelector("h3")?.innerText || "";
    if (title.includes("Verificadas")) {
      return "Nossa curadoria exige comprovação de CNPJ, histórico de resgates e visitas presenciais. Garantimos que sua intenção de adotar chegue a instituições sérias e comprometidas com a causa animal.";
    } else if (title.includes("Transparente")) {
      return "Zero taxas ocultas e zero burocracia comercial. Nós fornecemos o contato direto via WhatsApp ou e-mail oficial da ONG para que você alinhe a entrevista e a visita com total segurança.";
    } else if (title.includes("Humanizados")) {
      return "Cada bichinho tem sua ficha preenchida com carinho pela própria instituição, detalhando se convive bem com outros pets, nível de energia, vacinas e necessidades especiais.";
    } else {
      return "Oferecemos FAQs completas, guias passo a passo de adaptação do pet no novo lar e conexões diretas para campanhas de apoio e doações às ONGs parceiras.";
    }
  }
});