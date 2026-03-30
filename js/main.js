// ── 언어 토글 ──
function switchLang(targetLang) {
  var path = window.location.pathname;

  if (targetLang === 'en') {
    if (path === '/' || path.match(/^\/page\/\d+\//)) {
      window.location.href = '/en/';
      return;
    }
    var slug = path.replace(/^\/kr\//, '/en/');
    window.location.href = slug;
  } else {
    if (path === '/en/' || path.match(/^\/en\/page\/\d+\//)) {
      window.location.href = '/';
      return;
    }
    var slug = path.replace(/^\/en\//, '/kr/');
    window.location.href = slug;
  }
}

// ── 모바일 메뉴 토글 ──
function toggleMenu() {
  var menu = document.getElementById('mobileMenu');
  var body = document.body;
  menu.classList.toggle('open');
  body.classList.toggle('ar-menu-open');
}

// ── 사업자정보 토글 ──
function toggleBiz(btn) {
  btn.classList.toggle('open');
  document.getElementById('bizInfo').classList.toggle('open');
}
