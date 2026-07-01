document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const revealItems = document.querySelectorAll('[data-reveal]');

  const syncHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  const closeNav = () => {
    body.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  };

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const willOpen = !body.classList.contains('nav-open');
      body.classList.toggle('nav-open', willOpen);
      navToggle.setAttribute('aria-expanded', String(willOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeNav);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeNav();
    });
  }

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
});
