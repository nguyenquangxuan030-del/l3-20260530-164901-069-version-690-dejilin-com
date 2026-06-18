(function() {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function() {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = index;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }
    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        show(index);
      });
    });
    window.setInterval(function() {
      show((active + 1) % slides.length);
    }, 5200);
  }

  function buildSearchItem(movie) {
    var link = document.createElement('a');
    link.className = 'search-item';
    link.href = movie.url;

    var image = document.createElement('img');
    image.src = movie.cover;
    image.alt = movie.title;
    link.appendChild(image);

    var copy = document.createElement('span');
    var title = document.createElement('strong');
    title.textContent = movie.title;
    var meta = document.createElement('span');
    meta.textContent = [movie.year, movie.region, movie.genre].filter(Boolean).join(' · ');
    copy.appendChild(title);
    copy.appendChild(meta);
    link.appendChild(copy);

    return link;
  }

  function initGlobalSearch() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));
    var movies = window.SITE_MOVIES || [];
    boxes.forEach(function(box) {
      var input = box.querySelector('input[type="search"]');
      var panel = box.querySelector('[data-search-panel]');
      if (!input || !panel) {
        return;
      }
      input.addEventListener('input', function() {
        var query = normalize(input.value);
        panel.innerHTML = '';
        if (!query) {
          panel.classList.remove('open');
          return;
        }
        var results = movies.filter(function(movie) {
          return normalize(movie.title + ' ' + movie.year + ' ' + movie.region + ' ' + movie.genre + ' ' + movie.tags).indexOf(query) !== -1;
        }).slice(0, 12);
        results.forEach(function(movie) {
          panel.appendChild(buildSearchItem(movie));
        });
        panel.classList.toggle('open', results.length > 0);
      });
      document.addEventListener('click', function(event) {
        if (!box.contains(event.target)) {
          panel.classList.remove('open');
        }
      });
    });
  }

  function initCardTools() {
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
    var input = document.querySelector('[data-card-search]');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var current = 'all';
    var query = '';

    function update() {
      cards.forEach(function(card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region')
        ].join(' '));
        var matchedFilter = current === 'all' || text.indexOf(normalize(current)) !== -1;
        var matchedQuery = !query || text.indexOf(query) !== -1;
        card.classList.toggle('hidden', !(matchedFilter && matchedQuery));
      });
    }

    buttons.forEach(function(button) {
      button.addEventListener('click', function() {
        current = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function(item) {
          item.classList.toggle('active', item === button);
        });
        update();
      });
    });

    if (input) {
      input.addEventListener('input', function() {
        query = normalize(input.value);
        update();
      });
    }
  }

  ready(function() {
    initMenu();
    initHero();
    initGlobalSearch();
    initCardTools();
  });
})();
