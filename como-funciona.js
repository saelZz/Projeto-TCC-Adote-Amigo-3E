(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  function navigation() {
    const toggle = document.querySelector(".menu-toggle"),
      menu = document.querySelector("nav.menu");
    if (!toggle || !menu) return;
    function close() {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir navegação");
    }
    toggle.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar navegação" : "Abrir navegação");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        close();
        toggle.focus();
      }
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".navbar")) close();
    });
  }

  function journey() {
    const tabs = [...document.querySelectorAll("[role=tab]")],
      panels = [...document.querySelectorAll("[role=tabpanel]")],
      prev = document.getElementById("step-prev"),
      next = document.getElementById("step-next"),
      progress = document.getElementById("step-progress"),
      list = document.querySelector("[role=tablist]");
    let active = 0;

    function select(index, focus = false) {
      active = Math.max(0, Math.min(tabs.length - 1, index));
      tabs.forEach((t, i) => {
        t.setAttribute("aria-selected", String(i === active));
        t.tabIndex = i === active ? 0 : -1;
      });
      panels.forEach((p, i) => (p.hidden = i !== active));
      if (prev) prev.disabled = active === 0;
      if (next) next.disabled = active === tabs.length - 1;
      if (progress) progress.textContent = `Etapa ${active + 1} de ${tabs.length}`;
      if (focus) tabs[active]?.focus();
    }

    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      t.addEventListener("keydown", (e) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key))
          return;
        e.preventDefault();
        if (e.key === "Home") select(0, true);
        else if (e.key === "End") select(tabs.length - 1, true);
        else
          select(
            (active + (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) + tabs.length) %
              tabs.length,
            true,
          );
      });
    });

    prev?.addEventListener("click", () => select(active - 1));
    next?.addEventListener("click", () => select(active + 1));

    function orientation() {
      list?.setAttribute("aria-orientation", innerWidth <= 800 ? "horizontal" : "vertical");
    }
    orientation();
    addEventListener("resize", orientation);
    select(0);
  }

  function profile() {
    const dialog = document.getElementById("contact-dialog"),
      trigger = document.getElementById("contact-demo");
    if (!dialog || !trigger) return;

    trigger.addEventListener("click", () => {
      dialog.showModal();
      document.body.classList.add("modal-open");
    });

    dialog.querySelector(".dialog-close")?.addEventListener("click", () => dialog.close());

    dialog.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      trigger.focus();
    });

    dialog.addEventListener("click", (e) => {
      const r = dialog.getBoundingClientRect();
      if (
        e.target === dialog &&
        (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
      )
        dialog.close();
    });
  }

  navigation();
  journey();
  profile();
})();