// HolyClub 홈페이지 — 메뉴 · 나타나기 · 최신 소식(관리자 공지)
(function () {
  var body = document.body;
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function closeNav() { body.classList.remove('nav-open'); if (toggle) toggle.setAttribute('aria-expanded', 'false'); }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = !body.classList.contains('nav-open');
      body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    window.addEventListener('resize', function () { if (window.innerWidth > 760) closeNav(); });
  }

  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // 최신 소식: 관리자 화면에서 올린 공지를 받아 옵니다. 없거나 실패하면 이 칸은 숨긴 채로 둡니다.
  var news = document.querySelector('[data-news]');
  var list = document.querySelector('[data-news-list]');
  var host = location.hostname;
  if (!news || !list || !(host === 'holyclub.co.kr' || host === 'www.holyclub.co.kr')) return;

  function plain(html) { var d = document.createElement('div'); d.innerHTML = html || ''; return (d.textContent || '').trim(); }
  function cut(t, n) { return t.length > n ? t.slice(0, n - 1) + '…' : t; }

  var ctrl = 'AbortController' in window ? new AbortController() : null;
  if (ctrl) setTimeout(function () { ctrl.abort(); }, 6000);
  fetch('https://api.holyclub.co.kr/v1/notification/?limit=3&offset=0', ctrl ? { signal: ctrl.signal } : undefined)
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      var rows = data && Array.isArray(data.results) ? data.results.slice(0, 3) : [];
      if (!rows.length) return;
      rows.forEach(function (n) {
        var art = document.createElement('article');
        art.className = 'news-item';
        var h = document.createElement('h4');
        h.textContent = n.title || '안내';
        var p = document.createElement('p');
        p.textContent = cut(plain(n.content || n.body || ''), 110);
        art.appendChild(h); art.appendChild(p); list.appendChild(art);
      });
      news.hidden = false;
    })
    .catch(function () {});
})();
