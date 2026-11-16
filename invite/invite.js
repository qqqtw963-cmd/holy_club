(function () {
  'use strict';
  const params = new URLSearchParams(window.location.search);
  const values = params.getAll('invite');
  const code = values.length === 1 ? values[0].toUpperCase() : '';
  const open = document.getElementById('open-app');
  const status = document.getElementById('status');
  const title = document.getElementById('title');
  const description = document.getElementById('description');
  if (!/^[A-HJKMNP-Z2-9]{8}$/.test(code)) {
    document.getElementById('title').textContent = '초대 링크를 확인해주세요';
    document.getElementById('description').textContent = '링크가 올바르지 않아요. 초대한 분에게 링크를 다시 부탁해주세요.';
    return;
  }
  // Android KakaoTalk opens pasted HTTPS URLs in its own browser first.
  // Hand off immediately, without a timer/API request losing the link gesture.
  // Only the fixed app package and a validated code can become an Intent.
  const appUri = 'com.holyclub.app://invite?invite=' + encodeURIComponent(code);
  const canonical = 'https://holyclub.co.kr/invite/?invite=' + encodeURIComponent(code);
  const android = /Android/i.test(navigator.userAgent);
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const intent = 'intent://invite?invite=' + encodeURIComponent(code) +
    '#Intent;scheme=com.holyclub.app;package=com.holyclub.app;' +
    'S.browser_fallback_url=' + encodeURIComponent(canonical + '#manual') + ';end';
  const destination = android ? intent : appUri;
  const returnedToWeb = window.location.hash === '#manual';
  open.href = destination;
  open.hidden = false;

  let timeout;
  let handedOff = false;
  function showFallback() {
    clearTimeout(timeout);
    title.textContent = '앱에서 초대를 확인해 주세요';
    description.textContent = '앱이 열리지 않았다면 아래 버튼으로 다시 열 수 있어요. 초대코드는 그대로 전달돼요.';
    status.textContent = '앱이 없다면 설치한 뒤 이 초대 링크를 다시 눌러주세요.';
  }
  function pending() {
    handedOff = false;
    title.textContent = '홀리클럽으로 이동하고 있어요';
    description.textContent = '앱에서 초대를 확인하고 함께 루틴을 이어가요.';
    status.textContent = '설치된 홀리클럽 앱을 여는 중이에요…';
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      if (!handedOff && document.visibilityState !== 'hidden') showFallback();
    }, 1800);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      handedOff = true;
      clearTimeout(timeout);
    } else if (handedOff) {
      showFallback(); // Returning from the app must not launch it in a loop.
    }
  });
  window.addEventListener('pagehide', function () {
    handedOff = true;
    clearTimeout(timeout);
  });
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) showFallback();
  });
  open.addEventListener('click', function () {
    pending(); // Keep native href navigation inside the user's click gesture.
  });

  if (returnedToWeb) {
    // Chrome uses this URL when the app is missing or automatic launch is
    // blocked. Remove the marker so copying the link keeps a usable app link.
    window.history.replaceState(null, '', canonical);
    showFallback();
  } else if ((android || ios) && document.visibilityState !== 'hidden') {
    pending();
    try {
      window.location.replace(destination);
    } catch (_) {
      showFallback();
    }
  }
})();
