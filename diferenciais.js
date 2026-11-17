document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const section = document.querySelector(".aa-differences");
  const cards = document.querySelectorAll(".aa-card");

  if (!section || !cards.length) return;

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
    document.documentElement.classList.add("aa-enabled", "aa-section-visible");
  }
});