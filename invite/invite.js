(function () {
  'use strict';
  const params = new URLSearchParams(window.location.search);
  const values = params.getAll('invite');
  const code = values.length === 1 ? values[0].toUpperCase() : '';
  const open = document.getElementById('open-app');
  const status = document.getElementById('status');
  if (!/^[A-HJKMNP-Z2-9]{8}$/.test(code)) {
    document.getElementById('title').textContent = '초대 링크를 확인해주세요';
    document.getElementById('description').textContent = '링크가 올바르지 않아요. 초대한 분에게 링크를 다시 부탁해주세요.';
    return;
  }
  // Fixed scheme/host and a validated code; never accept a redirect destination.
  open.href = 'com.holyclub.app://invite?invite=' + encodeURIComponent(code);
  open.hidden = false;
  open.addEventListener('click', function () {
    status.textContent = '앱이 열리지 않으면 최신 버전으로 설치·업데이트한 뒤 이 링크를 다시 눌러주세요.';
  });
})();
