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
  // Public browser key only. This endpoint excludes private church/group/leader notices.
  const publicNews = Object.freeze({"url":"https://brlttopntfhqixgbupry.supabase.co","publishableKey":"sb_publishable_Vdyr9aKs5bfbLMR8mZ9uAg_7gni8Tz0"});
  let newsLoading = false;

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

  const truncate = (value, maxLength = 120) => {
    if (!value || value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 1)}…`;
  };

  const renderLiveNotices = (notices) => {
    if (!liveNotices) return;
    const cards = notices.slice(0, 3).map((notice) => {
      const article = document.createElement('article');
      article.className = 'feature feature--soft is-visible';
      const icon = document.createElement('div');
      icon.className = 'feature-icon';
      icon.textContent = '공지';
      const title = document.createElement('h3');
      title.textContent = String(notice.title || '안내');
      const text = String(notice.body || '').trim();
      const excerpt = document.createElement('p');
      excerpt.textContent = truncate(text, 110);
      article.append(icon, title);
      const published = new Date(notice.published_at);
      if (Number.isFinite(published.getTime())) {
        const time = document.createElement('time');
        time.dateTime = published.toISOString();
        time.textContent = published.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
        article.append(time);
      }
      article.append(excerpt);
      if (text.length > 110) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = '전체 내용 보기';
        summary.style.cursor = 'pointer';
        const fullText = document.createElement('p');
        fullText.textContent = text;
        fullText.style.whiteSpace = 'pre-wrap';
        details.append(summary, fullText);
        article.append(details);
      }
      return article;
    });
    if (cards.length === 0) {
      const empty = document.createElement('article');
      empty.className = 'feature feature--soft is-visible';
      const title = document.createElement('h3');
      title.textContent = '아직 등록된 소식이 없습니다';
      const description = document.createElement('p');
      description.textContent = '새 소식이 올라오면 여기에 보여드릴게요.';
      empty.append(title, description);
      cards.push(empty);
    }
    liveNotices.replaceChildren(...cards);
  };

  const fetchPublicNotices = async () => {
    if (!liveNotices || newsLoading) return;
    newsLoading = true;
    liveNotices.setAttribute('aria-live', 'polite');
    try {
      const response = await fetch(`${publicNews.url}/rest/v1/rpc/get_public_church_news`, {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json', apikey: publicNews.publishableKey },
        body: '{}',
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('public_news_unavailable');
      const notices = await response.json();
      if (!Array.isArray(notices) || notices.some((notice) => !notice || typeof notice !== 'object')) {
        throw new Error('invalid_public_news');
      }
      renderLiveNotices(notices);
    } catch (_) {
      const article = document.createElement('article');
      article.className = 'feature feature--soft is-visible';
      const title = document.createElement('h3');
      title.textContent = '소식을 불러오지 못했습니다';
      const description = document.createElement('p');
      description.textContent = '잠시 후 다시 시도해주세요.';
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'button button-secondary';
      retry.textContent = '다시 불러오기';
      retry.addEventListener('click', fetchPublicNotices);
      article.append(title, description, retry);
      liveNotices.replaceChildren(article);
    } finally {
      newsLoading = false;
    }
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

  const fetchHomeContent = async () => {
    try {
      const homeResponse = await fetch(normalizeApiUrl('/v1/home_content/current/'), {
        signal: AbortSignal.timeout(10000),
      });
      if (homeResponse.ok) {
        const homeContent = await homeResponse.json();
        applyHomeContent(homeContent);
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

  fetchHomeContent();
  fetchPublicNotices();
});
