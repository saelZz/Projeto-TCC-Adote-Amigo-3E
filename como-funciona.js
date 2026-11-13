/* Módulos de interação em JavaScript puro, sem dependências obrigatórias. */
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
  function preference() {
    const input = document.getElementById("hide-onboarding"),
      status = document.getElementById("preference-status");
    if (!input || !status) return;
    try {
      input.checked = localStorage.getItem("hideOnboarding") === "true";
    } catch {
      status.textContent = "Preferência indisponível neste navegador.";
    }
    input.addEventListener("change", () => {
      try {
        if (input.checked) localStorage.setItem("hideOnboarding", "true");
        else localStorage.removeItem("hideOnboarding");
        status.textContent = input.checked
          ? "Preferência salva."
          : "O guia pode aparecer novamente.";
      } catch {
        status.textContent = "Não foi possível salvar sua preferência.";
      }
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
  function faq() {
    const items = [...document.querySelectorAll(".cf-faq-item")];
    function open(target, enabled) {
      items.forEach((item) => {
        const active = item === target && enabled;
        item.classList.toggle("open", active);
        item.querySelector("button")?.setAttribute("aria-expanded", String(active));
        item.querySelector(".cf-answer")?.setAttribute("aria-hidden", String(!active));
      });
    }
    items.forEach((item) =>
      item
        .querySelector("button")
        ?.addEventListener("click", () => open(item, !item.classList.contains("open"))),
    );
    function hash() {
      const item = items.find((i) => `#${i.id}` === location.hash);
      if (item) {
        open(item, true);
        item.scrollIntoView({ behavior: reduced.matches ? "instant" : "smooth", block: "center" });
      }
    }
    addEventListener("hashchange", hash);
    hash();
  }
  function profile() {
    const photo = document.getElementById("profile-photo"),
      buttons = [...document.querySelectorAll("[data-view]")];
    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        photo?.classList.toggle("detail", b.dataset.view === "1");
        buttons.forEach((v) => v.setAttribute("aria-pressed", String(v === b)));
      }),
    );
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
  function floatingCta() {
    const cta = document.querySelector(".floating-cta"),
      closing = document.querySelector(".closing");
    let queued = false;
    function update() {
      cta?.classList.toggle(
        "visible",
        scrollY > 650 && Boolean(closing && closing.getBoundingClientRect().top > innerHeight),
      );
      queued = false;
    }
    addEventListener(
      "scroll",
      () => {
        if (!queued) {
          queued = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    addEventListener("resize", update);
    update();
  }
  function lottie() {
    const player = document.getElementById("welcome-player"),
      frame = document.querySelector(".lottie-frame");
    if (!player || !frame) return;
    let ready = false;
    const stop = () => player.stop?.();
    const play = () => {
      if (ready && !reduced.matches) player.play?.();
    };
    player.addEventListener("ready", () => {
      ready = true;
      player.classList.toggle("ready", !reduced.matches);
    });
    player.addEventListener("error", () => {
      ready = false;
      player.classList.remove("ready");
    });
    frame.addEventListener("pointerenter", play);
    frame.addEventListener("pointerleave", stop);
    frame.addEventListener("touchstart", play, { passive: true });
    frame.addEventListener("touchend", stop, { passive: true });
    reduced.addEventListener("change", () => {
      stop();
      player.classList.toggle("ready", ready && !reduced.matches);
    });
  }
  navigation();
  preference();
  journey();
  faq();
  profile();
  floatingCta();
  lottie();
})();
