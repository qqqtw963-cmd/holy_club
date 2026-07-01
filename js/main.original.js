document.addEventListener('DOMContentLoaded', function () {
    // sticky header style on scroll
    const header = document.querySelector('[data-hc-header]');
    const logo = document.querySelector('[data-hc-logo]');
    const word = document.querySelector('[data-hc-word]');
    const navs = document.querySelectorAll('[data-hc-nav]');
    const onScroll = () => {
      const s = window.scrollY > 40;
      if (header) {
        header.style.background = s ? 'rgba(251,252,254,.85)' : 'transparent';
        header.style.backdropFilter = s ? 'blur(14px)' : 'none';
        header.style.boxShadow = s ? '0 1px 0 rgba(30,70,110,.08)' : 'none';
        header.style.padding = s ? '14px clamp(20px,5vw,64px)' : '22px clamp(20px,5vw,64px)';
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // responsive: show nav links on wide screens, collapse hero grid on narrow
    const applyResponsive = () => {
      const wide = window.innerWidth > 860;
      navs.forEach(n => n.style.display = wide ? 'inline' : 'none');
      const grids = {
        '[data-hc-herogrid]': 880, '[data-hc-meaningrid]': 760,
        '[data-hc-whygrid]': 720, '[data-hc-expgrid]': 860
      };
      Object.entries(grids).forEach(([sel, bp]) => {
        const el = document.querySelector(sel);
        if (el) el.style.gridTemplateColumns = window.innerWidth > bp ? el.dataset.cols || '' : '1fr';
      });
      const fg = document.querySelector('[data-hc-featgrid]');
      if (fg) fg.style.gridTemplateColumns = window.innerWidth > 820 ? 'repeat(6,1fr)' : '1fr';
    };
    // store original columns
    const hg = document.querySelector('[data-hc-herogrid]'); if (hg) hg.dataset.cols = '1.05fr .95fr';
    const mg = document.querySelector('[data-hc-meaningrid]'); if (mg) mg.dataset.cols = 'repeat(3,1fr)';
    const wg = document.querySelector('[data-hc-whygrid]'); if (wg) wg.dataset.cols = '1fr 1fr';
    const eg = document.querySelector('[data-hc-expgrid]'); if (eg) eg.dataset.cols = '1fr 1fr';
    applyResponsive();
    window.addEventListener('resize', applyResponsive);

    // scroll reveal
    const items = document.querySelectorAll('[data-reveal]');
    items.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity .9s cubic-bezier(.22,.61,.36,1), transform .9s cubic-bezier(.22,.61,.36,1)';
    });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'none';
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      items.forEach(el => io.observe(el));
    } else {
      items.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    }
});
