(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      setHero(dotIndex);
    });
  });

  if (slides.length > 1) {
    setHero(0);
    window.setInterval(function () {
      setHero(activeIndex + 1);
    }, 5800);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
  var emptyResult = document.querySelector('[data-empty-result]');
  var searchStatus = document.querySelector('[data-search-status]');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter(value) {
    var keyword = normalize(value);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyResult) {
      emptyResult.classList.toggle('is-visible', visible === 0);
    }

    if (searchStatus) {
      searchStatus.textContent = keyword ? '已筛选出 ' + visible + ' 个相关内容' : '';
    }
  }

  if (filterInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      filterInput.value = query;
    }

    applyFilter(filterInput.value);

    filterInput.addEventListener('input', function () {
      applyFilter(filterInput.value);
    });
  }
})();
