// ── AU RÊVE Journal — main.js ──

// Config
var SHOP_URL = 'https://www.shopaureve.com';
var DEFAULT_LANG = 'kr';

// State
var currentLang = DEFAULT_LANG;
var currentPage = 1;
var posts = [];

// On page load
document.addEventListener('DOMContentLoaded', function() {
  parseHash();
  loadPosts();
});

// Parse URL hash
function parseHash() {
  var hash = window.location.hash.replace('#', '');
  if (!hash) return;
  var parts = hash.split('/');
  if (parts[0] === 'en' || parts[0] === 'kr') {
    currentLang = parts[0];
  }
  if (parts[1]) {
    currentPage = parseInt(parts[1]) || 1;
  }
  updateLangButton();
}

// Load posts manifest
function loadPosts() {
  fetch('/posts/index.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      posts = data.posts;
      loadCurrentPost();
    });
}

// Load and render current post
function loadCurrentPost() {
  if (posts.length === 0) return;

  var idx = currentPage - 1;
  if (idx < 0 || idx >= posts.length) idx = 0;

  var post = posts[idx];
  var mdPath = '/posts/' + currentLang + '/' + post.slug + '.md';

  fetch(mdPath)
    .then(function(r) {
      if (!r.ok) throw new Error('not found');
      return r.text();
    })
    .then(function(md) {
      var body = md.replace(/^---[\s\S]*?---\n*/, '');
      renderPost(post, body);
      renderPagination();
    })
    .catch(function() {
      // If translation doesn't exist, try other language
      var fallback = currentLang === 'kr' ? 'en' : 'kr';
      var fallbackPath = '/posts/' + fallback + '/' + post.slug + '.md';
      fetch(fallbackPath)
        .then(function(r) { return r.text(); })
        .then(function(md) {
          var body = md.replace(/^---[\s\S]*?---\n*/, '');
          renderPost(post, body);
          renderPagination();
        });
    });
}

// Render post HTML
// Note: Content comes from our own local markdown files served as static assets,
// not from untrusted user input. marked.js is the standard library for this pattern.
function renderPost(post, markdownBody) {
  var title = post.title[currentLang] || post.title['kr'] || post.title['en'];
  var container = document.getElementById('journal-content');

  // Clear existing content
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Cover image
  if (post.cover) {
    var coverDiv = document.createElement('div');
    coverDiv.className = 'ar-entry__cover';
    var img = document.createElement('img');
    img.src = post.cover;
    img.alt = title;
    coverDiv.appendChild(img);
    container.appendChild(coverDiv);
  }

  // Meta (tag + date)
  var metaDiv = document.createElement('div');
  metaDiv.className = 'ar-entry__meta';
  var tagSpan = document.createElement('span');
  tagSpan.className = 'ar-entry__tag';
  tagSpan.textContent = post.tag;
  var dateSpan = document.createElement('span');
  dateSpan.className = 'ar-entry__date';
  dateSpan.textContent = formatDate(post.date);
  metaDiv.appendChild(tagSpan);
  metaDiv.appendChild(dateSpan);
  container.appendChild(metaDiv);

  // Title
  var titleEl = document.createElement('h2');
  titleEl.className = 'ar-entry__title';
  titleEl.textContent = title;
  container.appendChild(titleEl);

  // Body — rendered from our own static markdown files via marked.js
  var bodyDiv = document.createElement('div');
  bodyDiv.className = 'ar-entry__body';
  var parsed = marked.parse(markdownBody);
  // Using a trusted template element to parse our own markdown content
  var template = document.createElement('template');
  template.innerHTML = parsed;
  bodyDiv.appendChild(template.content);
  container.appendChild(bodyDiv);
}

// Render pagination
function renderPagination() {
  var total = posts.length;
  var nav = document.getElementById('journal-pagination');

  // Clear existing
  while (nav.firstChild) {
    nav.removeChild(nav.firstChild);
  }

  // Previous arrow
  if (currentPage > 1) {
    var prevLink = document.createElement('a');
    prevLink.href = '#' + currentLang + '/' + (currentPage - 1);
    prevLink.className = 'arrow';
    prevLink.innerHTML = '&larr;';
    prevLink.addEventListener('click', function(e) { e.preventDefault(); goPage(currentPage - 1); });
    nav.appendChild(prevLink);
  } else {
    var hiddenPrev = document.createElement('span');
    hiddenPrev.className = 'arrow';
    hiddenPrev.style.visibility = 'hidden';
    hiddenPrev.innerHTML = '&larr;';
    nav.appendChild(hiddenPrev);
  }

  // Page numbers
  for (var i = 1; i <= total; i++) {
    if (i === currentPage) {
      var activeSpan = document.createElement('span');
      activeSpan.className = 'active';
      activeSpan.textContent = i;
      nav.appendChild(activeSpan);
    } else {
      var pageLink = document.createElement('a');
      pageLink.href = '#' + currentLang + '/' + i;
      pageLink.textContent = i;
      (function(pageNum) {
        pageLink.addEventListener('click', function(e) { e.preventDefault(); goPage(pageNum); });
      })(i);
      nav.appendChild(pageLink);
    }
  }

  // Next arrow
  if (currentPage < total) {
    var nextLink = document.createElement('a');
    nextLink.href = '#' + currentLang + '/' + (currentPage + 1);
    nextLink.className = 'arrow';
    nextLink.innerHTML = '&rarr;';
    nextLink.addEventListener('click', function(e) { e.preventDefault(); goPage(currentPage + 1); });
    nav.appendChild(nextLink);
  } else {
    var hiddenNext = document.createElement('span');
    hiddenNext.className = 'arrow';
    hiddenNext.style.visibility = 'hidden';
    hiddenNext.innerHTML = '&rarr;';
    nav.appendChild(hiddenNext);
  }
}

// Format date
function formatDate(dateStr) {
  var parts = dateStr.split('-');
  return parts[0] + '. ' + parts[1] + '. ' + parts[2];
}

// Go to page
function goPage(num) {
  currentPage = num;
  window.location.hash = currentLang + '/' + num;
  loadCurrentPost();
  window.scrollTo(0, 0);
}

// Language toggle
function switchLang(lang) {
  currentLang = lang;
  window.location.hash = currentLang + '/' + currentPage;
  updateLangButton();
  loadCurrentPost();
}

function updateLangButton() {
  // Update toggle button
  var btn = document.querySelector('.ar-lang-toggle');
  if (btn) {
    btn.textContent = currentLang === 'kr' ? 'EN' : 'KR';
    btn.setAttribute('onclick', "switchLang('" + (currentLang === 'kr' ? 'en' : 'kr') + "')");
  }
  // Update hero subtitle
  var subtitle = document.getElementById('journal-subtitle');
  if (subtitle) {
    subtitle.textContent = currentLang === 'en'
      ? 'Stories, style guides, and inspiration from AU REVE.'
      : '오헤브의 이야기, 스타일 가이드, 그리고 영감.';
  }
  // Update html lang attribute
  document.documentElement.lang = currentLang === 'en' ? 'en' : 'ko';
}

// Mobile menu toggle
function toggleMenu() {
  var menu = document.getElementById('mobileMenu');
  document.body.classList.toggle('ar-menu-open');
  menu.classList.toggle('open');
}

// Business info toggle
function toggleBiz(btn) {
  btn.classList.toggle('open');
  document.getElementById('bizInfo').classList.toggle('open');
}

// Listen for hash changes
window.addEventListener('hashchange', function() {
  parseHash();
  loadCurrentPost();
});
