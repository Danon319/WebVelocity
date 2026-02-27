document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. THEME SWITCHER
  ========================================================= */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const newTheme = htmlElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }


  /* =========================================================
     2. HEADER MORPHING (HERO MODE)
  ========================================================= */
  const mainHeader = document.getElementById('main-header');
  const heroSection = document.querySelector('.hero-section');

  if (mainHeader && heroSection) {
    new IntersectionObserver(
      ([entry]) => mainHeader.classList.toggle('hero-mode', entry.isIntersecting),
      { rootMargin: '-100px 0px 0px 0px' }
    ).observe(heroSection);
  }


  /* =========================================================
     3. КОНТАКТНАЯ ФОРМА: Переключатель онлайн / офлайн
  ========================================================= */
  const officesData = {
    'Москва': [
      { id: 'msk_001', name: 'Офис на Тверской',  address: 'ул. Тверская, д. 15, офис 301',                  coords: '55.764832,37.605383' },
      { id: 'msk_002', name: 'Офис в Сити',        address: 'Пресненская наб., д. 12, башня Федерация',       coords: '55.749144,37.537553' },
      { id: 'msk_003', name: 'Офис на Арбате',     address: 'ул. Арбат, д. 24, офис 205',                    coords: '55.751244,37.589447' },
    ],
    'Санкт-Петербург': [
      { id: 'spb_001', name: 'Офис на Невском',       address: 'Невский проспект, д. 85, офис 402',          coords: '59.930599,30.360396' },
      { id: 'spb_002', name: 'Офис на Васильевском',  address: 'Васильевский остров, 7-я линия, д. 34',      coords: '59.941546,30.282530' },
    ],
    'Новосибирск': [
      { id: 'nsk_001', name: 'Офис в центре', address: 'Красный проспект, д. 28, офис 501', coords: '55.030204,82.920430' },
    ],
    'Екатеринбург': [
      { id: 'ekb_001', name: 'Офис на Ленина',       address: 'пр. Ленина, д. 52, офис 301',         coords: '56.838011,60.597465' },
      { id: 'ekb_002', name: 'Офис в Академическом', address: 'ул. Вайнера, д. 9А, офис 204',        coords: '56.837554,60.602836' },
    ],
    'Казань': [
      { id: 'kzn_001', name: 'Офис в центре', address: 'ул. Баумана, д. 58, офис 302', coords: '55.789421,49.122764' },
    ],
  };

  let currentMode    = 'online';
  let selectedCity   = null;
  let selectedOffice = null;

  const toggleBtns        = document.querySelectorAll('.toggle-btn');
  const onlineFields      = document.getElementById('onlineFields');
  const offlineFields     = document.getElementById('offlineFields');
  const officeSelectBtn   = document.getElementById('officeSelectBtn');
  const selectedOfficeText = document.getElementById('selectedOfficeText');
  const modal             = document.getElementById('officeModal');
  const closeModalBtn     = document.getElementById('closeModal');
  const citiesGrid        = document.getElementById('citiesGrid');
  const officesList       = document.getElementById('officesList');
  const citySearch        = document.getElementById('citySearch');
  const contactForm       = document.getElementById('contactForm');

  // --- Переключение онлайн / офлайн ---
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;

      const isOnline = currentMode === 'online';
      // Используем CSS-класс вместо inline style для управления видимостью
      onlineFields.style.display  = isOnline ? 'block' : 'none';
      offlineFields.style.display = isOnline ? 'none'  : 'block';
    });
  });

  // --- Управление модальным окном офисов ---
  // FIX: единственная функция закрытия — нет дублирования кода
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (officeSelectBtn) officeSelectBtn.addEventListener('click', openModal);
  if (closeModalBtn)   closeModalBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // --- Рендер городов (FIX: DocumentFragment — один reflow вместо N) ---
  function renderCities(filter = '') {
    const lowerFilter = filter.toLowerCase();
    const fragment = document.createDocumentFragment();

    Object.keys(officesData).forEach(city => {
      const btn = document.createElement('button');
      btn.className = 'city-btn';
      btn.textContent = city;
      btn.type = 'button';

      if (filter && !city.toLowerCase().includes(lowerFilter)) {
        btn.classList.add('hidden');
      }
      if (city === selectedCity) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => {
        selectedCity = city;
        renderCities(filter);
        renderOffices(city);
      });

      fragment.appendChild(btn);
    });

    // Один DOM-update вместо N поочерёдных вставок
    citiesGrid.innerHTML = '';
    citiesGrid.appendChild(fragment);
  }

  // --- Рендер офисов (FIX: DocumentFragment) ---
  function renderOffices(city) {
    const offices  = officesData[city];
    const fragment = document.createDocumentFragment();

    const title = document.createElement('h3');
    title.className = 'offices-title';
    title.textContent = `Офисы в городе ${city}`;
    fragment.appendChild(title);

    offices.forEach(office => {
      const isSelected = selectedOffice?.id === office.id;

      const card = document.createElement('div');
      card.className = isSelected ? 'office-card selected' : 'office-card';

      const nameEl = document.createElement('div');
      nameEl.className = 'office-name';
      nameEl.textContent = office.name;

      if (isSelected) {
        const badge = document.createElement('span');
        badge.className = 'selected-office-badge';
        badge.textContent = 'Выбрано';
        nameEl.appendChild(badge);
      }

      const addressEl = document.createElement('div');
      addressEl.className = 'office-address';
      addressEl.textContent = office.address;

      const actions = document.createElement('div');
      actions.className = 'office-actions';

      const mapBtn = document.createElement('button');
      mapBtn.className = 'btn btn-map';
      mapBtn.textContent = 'Открыть на карте';
      mapBtn.type = 'button';
      mapBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(`https://www.google.com/maps/search/?api=1&query=${office.coords}`, '_blank');
      });

      const selectBtn = document.createElement('button');
      selectBtn.className = 'btn btn-select';
      selectBtn.textContent = 'Выбрать офис';
      selectBtn.type = 'button';
      selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectOffice(office);
      });

      actions.append(mapBtn, selectBtn);
      card.append(nameEl, addressEl, actions);
      card.addEventListener('click', () => selectOffice(office));

      fragment.appendChild(card);
    });

    officesList.innerHTML = '';
    officesList.appendChild(fragment);
  }

  function selectOffice(office) {
    selectedOffice = office;
    selectedOfficeText.textContent = `${office.name} — ${office.address}`;
    officeSelectBtn.classList.add('selected');
    closeModal();
    if (selectedCity) renderOffices(selectedCity);
  }

  // FIX: Debounce поиска — не перерисовывать при каждом нажатии клавиши
  let searchTimeout;
  citySearch.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => renderCities(e.target.value), 150);
  });

  // --- Отправка формы ---
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (currentMode === 'online') {
      const _formData = {
        name:    document.getElementById('name').value,
        email:   document.getElementById('email').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value,
      };
      // TODO: отправить _formData на сервер
    } else {
      if (!selectedOffice) return;
      const _formData = {
        name:     document.getElementById('offlineName').value,
        phone:    document.getElementById('phone').value,
        officeId: selectedOffice.id,
      };
      // TODO: отправить _formData на сервер
    }
  });

  renderCities();


  /* =========================================================
     4. КНОПКА С АНИМАЦИЕЙ ДОСТАВКИ
  ========================================================= */
  document.querySelectorAll('.submit-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (this.classList.contains('animating')) return;

      const btnText     = this.querySelector('.btn-text');
      const initialText = btnText.dataset.initial;
      const successText = btnText.dataset.success;

      this.classList.add('animating');

      setTimeout(() => {
        this.classList.add('delivered');
        btnText.textContent = successText;
      }, 4000);

      setTimeout(() => {
        this.classList.remove('animating', 'delivered');
        btnText.textContent = initialText;
      }, 6000);
    });
  });


  /* =========================================================
     5. КАРУСЕЛЬ ПРОЕКТОВ
  ========================================================= */
  (function () {
    const track     = document.getElementById('projectsTrack');
    const prevBtn   = document.getElementById('prevBtn');
    const nextBtn   = document.getElementById('nextBtn');
    const mobilePrev = document.querySelector('.mobile-prev');
    const mobileNext = document.querySelector('.mobile-next');
    const dotsNav   = document.getElementById('dotsNav');
    const cards     = document.querySelectorAll('.project-card');

    if (!track || !cards.length) return;

    let currentIndex = 0;
    const totalSlides = cards.length;
    const dots = [];

    // FIX: Кешированные размеры — не читаем DOM при каждом слайде
    let cardWidth = 0;
    let cardGap   = 0;

    function recalcDimensions() {
      cardWidth = cards[0].offsetWidth;
      cardGap   = parseFloat(getComputedStyle(track).gap) || 48;
    }

    // --- Точки навигации ---
    const dotFragment = document.createDocumentFragment();
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotFragment.appendChild(dot);
      dots.push(dot);
    }
    dotsNav.appendChild(dotFragment);

    function updateSlide() {
      const offset = -(currentIndex * (cardWidth + cardGap));
      track.style.transform = `translateX(${offset}px)`;

      // FIX: classList.toggle вместо forEach с условием
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));

      prevBtn.classList.toggle('disabled', currentIndex === 0);
      nextBtn.classList.toggle('disabled', currentIndex === totalSlides - 1);

      if (mobilePrev && mobileNext) {
        mobilePrev.classList.toggle('disabled', currentIndex === 0);
        mobileNext.classList.toggle('disabled', currentIndex === totalSlides - 1);
      }
    }

    function goToSlide(index) {
      if (index >= 0 && index < totalSlides) {
        currentIndex = index;
        updateSlide();
      }
    }

    function prevSlide() { goToSlide(currentIndex - 1); }
    function nextSlide() { goToSlide(currentIndex + 1); }

    // --- Touch / Swipe ---
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
    }, { passive: true });

    // --- Кнопки ---
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    if (mobilePrev) mobilePrev.addEventListener('click', prevSlide);
    if (mobileNext) mobileNext.addEventListener('click', nextSlide);

    // FIX: debounce resize + пересчёт размеров отдельно от updateSlide
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        recalcDimensions();
        updateSlide();
      }, 100);
    });

    recalcDimensions();
    updateSlide();
  })();


  /* =========================================================
     6. МОБИЛЬНОЕ МЕНЮ
  ========================================================= */
  const burgerBtn          = document.getElementById('burger-btn');
  const mobileMenuDropdown = document.getElementById('mobile-menu-dropdown');
  const mobileNavLinks     = document.querySelectorAll('.mobile-nav-link');

  function toggleMobileMenu() {
    const isOpen = mobileMenuDropdown.classList.toggle('active');
    burgerBtn.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (mobileMenuDropdown.classList.contains('active')) toggleMobileMenu();
  }

  if (burgerBtn) {
    burgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  }

  mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

  if (mobileMenuDropdown) {
    mobileMenuDropdown.addEventListener('click', (e) => e.stopPropagation());
  }

  // Закрытие по клику вне меню
  document.addEventListener('click', (e) => {
    if (
      mobileMenuDropdown.classList.contains('active') &&
      !mobileMenuDropdown.contains(e.target) &&
      !burgerBtn.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });


  /* =========================================================
     7. ЕДИНЫЙ ОБРАБОТЧИК КЛАВИАТУРЫ
     FIX: было 3 отдельных document.addEventListener('keydown')
          — объединены в один, нет дублирующихся слушателей
  ========================================================= */
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'Escape':
        closeModal();
        closeMobileMenu();
        break;
      case 'ArrowLeft':
        // Стрелки работают только когда карусель в фокусе / видна
        if (!modal.classList.contains('active')) {
          e.preventDefault();
          document.getElementById('prevBtn')?.click();
        }
        break;
      case 'ArrowRight':
        if (!modal.classList.contains('active')) {
          e.preventDefault();
          document.getElementById('nextBtn')?.click();
        }
        break;
    }
  });

});