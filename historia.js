(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileView = window.matchMedia('(max-width: 768px)');
  const story = document.querySelector('#story-experience');
  const storyButton = story?.querySelector('.story-toggle');

  function setStory(open) {
    if (!story || !storyButton) return;
    story.classList.toggle('is-open', open);
    storyButton.setAttribute('aria-expanded', String(open));
  }

  function syncStoryToViewport(event) {
    if (event.matches) setStory(true);
  }

  if (story && storyButton) {
    setStory(mobileView.matches);
    storyButton.addEventListener('click', () => {
      if (mobileView.matches) return;
      setStory(!story.classList.contains('is-open'));
    });
    mobileView.addEventListener('change', syncStoryToViewport);
  }

  document.querySelectorAll('.faq-trigger').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.faq-card');
      if (!card) return;
      const willOpen = !card.classList.contains('is-open');
      document.querySelectorAll('.faq-card.is-open').forEach((openCard) => {
        openCard.classList.remove('is-open');
        openCard.querySelector('.faq-trigger')?.setAttribute('aria-expanded', 'false');
      });
      card.classList.toggle('is-open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });
    reveals.forEach((element) => observer.observe(element));
  }
})();
