/* =========================================================
   FAQ — Adote Amigo
   Acordeão acessível, animação ao rolar e abertura por hash.
   ========================================================= */

(() => {
  "use strict";

  const cards = Array.from(document.querySelectorAll(".faq-card"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let highlightTimer;

  // Mantém somente uma pergunta aberta por vez.
  function setCardState(card, shouldOpen) {
    const trigger = card.querySelector(".faq-trigger");
    const panel = card.querySelector(".faq-panel");

    if (!trigger || !panel) return;

    card.dataset.open = String(shouldOpen);
    trigger.setAttribute("aria-expanded", String(shouldOpen));
    panel.setAttribute("aria-hidden", String(!shouldOpen));
  }

  function closeOtherCards(activeCard) {
    cards.forEach((card) => {
      if (card !== activeCard) setCardState(card, false);
    });
  }

  function updateUrl(card, isOpen) {
    const baseUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", isOpen ? `#${card.id}` : baseUrl);
  }

  function toggleCard(card) {
    const willOpen = card.dataset.open !== "true";
    closeOtherCards(card);
    setCardState(card, willOpen);
    updateUrl(card, willOpen);
  }

  cards.forEach((card) => {
    const trigger = card.querySelector(".faq-trigger");
    trigger?.addEventListener("click", () => toggleCard(card));
  });

  // Abre e destaca o item indicado em links como #faq-2.
  function openFromHash() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = cards.find((card) => card.id === id);

    if (!target) return;

    closeOtherCards(target);
    setCardState(target, true);
    cards.forEach((card) => { card.dataset.highlighted = "false"; });
    target.dataset.highlighted = "true";

    window.clearTimeout(highlightTimer);
    window.setTimeout(() => {
      target.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "center"
      });
    }, 120);

    highlightTimer = window.setTimeout(() => {
      target.dataset.highlighted = "false";
    }, 2200);
  }

  window.addEventListener("hashchange", openFromHash);
  openFromHash();

  // Revela os elementos somente uma vez conforme entram na tela.
  const revealItems = document.querySelectorAll(".reveal");

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => { item.dataset.visible = "true"; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.dataset.visible = "true";
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
})();
