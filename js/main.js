document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const revealItems = document.querySelectorAll('[data-reveal]');
  const homeEyebrow = document.querySelector('[data-home-eyebrow]');
  const homeTitle = document.querySelector('[data-home-title]');
  const homeSubtitle = document.querySelector('[data-home-subtitle]');
  const homeCta = document.querySelector('[data-home-cta]');
  const liveNotices = document.querySelector('[data-live-notices]');

  const resolveApiBaseUrl = () => {
    if (window.HOLYCLUB_API_BASE_URL) return window.HOLYCLUB_API_BASE_URL;
    if (document.body.dataset.apiBaseUrl) return document.body.dataset.apiBaseUrl;

    const { hostname, origin } = window.location;

    if (hostname === 'holyclub.co.kr' || hostname === 'www.holyclub.co.kr') {
      return 'https://api.holyclub.co.kr';
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:8000';
    }

    return origin;
  };

  const apiBaseUrl = resolveApiBaseUrl();

  const syncHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  const closeNav = () => {
    body.classList.remove('nav-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  };

  const normalizeApiUrl = (path) => `${apiBaseUrl.replace(/\/+$/, '')}/${String(path).replace(/^\/+/, '')}`;

  const stripHtml = (value) => {
    const temp = document.createElement('div');
    temp.innerHTML = value || '';
    return (temp.textContent || temp.innerText || '').trim();
  };

  const truncate = (value, maxLength = 120) => {
    if (!value || value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 1)}…`;
  };

  const renderLiveNotices = (notices) => {
    if (!liveNotices || !Array.isArray(notices) || notices.length === 0) return;

    liveNotices.innerHTML = notices
      .slice(0, 3)
      .map((notice) => {
        const content = truncate(stripHtml(notice.content || notice.body || ''), 110);
        return `
          <article class="feature feature--soft" data-reveal>
            <div class="feature-icon">공지</div>
            <h3>${notice.title || '안내'}</h3>
            <p>${content || '공지 내용을 불러오는 중입니다.'}</p>
          </article>
        `;
      })
      .join('');

    liveNotices.querySelectorAll('[data-reveal]').forEach((item) => item.classList.add('is-visible'));
  };

  const getContentValue = (content, camelKey, snakeKey) => content?.[camelKey] || content?.[snakeKey];

  const applyHomeContent = (content) => {
    if (!content) return;

    const eyebrow = getContentValue(content, 'eyebrow', 'eyebrow');
    const mainTitle = getContentValue(content, 'mainTitle', 'main_title');
    const subTitle = getContentValue(content, 'subTitle', 'sub_title');
    const ctaText = getContentValue(content, 'ctaText', 'cta_text');
    const ctaLink = getContentValue(content, 'ctaLink', 'cta_link');

    if (homeEyebrow && eyebrow) {
      homeEyebrow.textContent = eyebrow;
    }

    if (homeTitle && mainTitle) {
      homeTitle.innerHTML = String(mainTitle).replace(/\n/g, '<br>');
    }

    if (homeSubtitle && subTitle) {
      homeSubtitle.textContent = subTitle;
    }

    if (homeCta && ctaText) {
      homeCta.textContent = ctaText;
    }

    if (homeCta && ctaLink) {
      homeCta.setAttribute('href', ctaLink);
    }
  };

  const fetchRuntimeContent = async () => {
    try {
      const [homeResponse, noticeResponse] = await Promise.all([
        fetch(normalizeApiUrl('/v1/home_content/current/')),
        fetch(normalizeApiUrl('/v1/notification/?limit=3&offset=0')),
      ]);

      if (homeResponse.ok) {
        const homeContent = await homeResponse.json();
        applyHomeContent(homeContent);
      }

      if (noticeResponse.ok) {
        const noticePayload = await noticeResponse.json();
        renderLiveNotices(noticePayload.results || []);
      }
    } catch (error) {
      console.warn('HolyClub live content fetch failed:', error);
    }
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

  fetchRuntimeContent();
});
