document.addEventListener('DOMContentLoaded', () => {
  
  /* 1. THEME SWITCHER */
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      htmlElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  /* 2. HEADER MORPHING (HERO MODE) */
  const mainHeader = document.getElementById('main-header');
  const heroSection = document.querySelector('.hero-section');

  if (mainHeader && heroSection) {
    const observerOptions = {
      root: null,
      threshold: 0,
      // Срабатывает, когда низ Hero-секции проходит 100px от верха экрана
      rootMargin: "-100px 0px 0px 0px"
    };

    const headerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Мы в Hero-секции -> Свернуть хедер
          mainHeader.classList.add('hero-mode');
        } else {
          // Мы прокрутили вниз -> Развернуть хедер
          mainHeader.classList.remove('hero-mode');
        }
      });
    }, observerOptions);

    headerObserver.observe(heroSection);
  }



  const officesData = {
      'Москва': [
        { id: 'msk_001', name: 'Офис на Тверской', address: 'ул. Тверская, д. 15, офис 301', coords: '55.764832,37.605383' },
        { id: 'msk_002', name: 'Офис в Сити', address: 'Пресненская наб., д. 12, башня Федерация', coords: '55.749144,37.537553' },
        { id: 'msk_003', name: 'Офис на Арбате', address: 'ул. Арбат, д. 24, офис 205', coords: '55.751244,37.589447' }
      ],
      'Санкт-Петербург': [
        { id: 'spb_001', name: 'Офис на Невском', address: 'Невский проспект, д. 85, офис 402', coords: '59.930599,30.360396' },
        { id: 'spb_002', name: 'Офис на Васильевском', address: 'Васильевский остров, 7-я линия, д. 34', coords: '59.941546,30.282530' }
      ],
      'Новосибирск': [
        { id: 'nsk_001', name: 'Офис в центре', address: 'Красный проспект, д. 28, офис 501', coords: '55.030204,82.920430' }
      ],
      'Екатеринбург': [
        { id: 'ekb_001', name: 'Офис на Ленина', address: 'пр. Ленина, д. 52, офис 301', coords: '56.838011,60.597465' },
        { id: 'ekb_002', name: 'Офис в Академическом', address: 'ул. Вайнера, д. 9А, офис 204', coords: '56.837554,60.602836' }
      ],
      'Казань': [
        { id: 'kzn_001', name: 'Офис в центре', address: 'ул. Баумана, д. 58, офис 302', coords: '55.789421,49.122764' }
      ]
    };

    let currentMode = 'online';
    let selectedCity = null;
    let selectedOffice = null;

    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const onlineFields = document.getElementById('onlineFields');
    const offlineFields = document.getElementById('offlineFields');
    const officeSelectBtn = document.getElementById('officeSelectBtn');
    const selectedOfficeText = document.getElementById('selectedOfficeText');
    const modal = document.getElementById('officeModal');
    const closeModalBtn = document.getElementById('closeModal');
    const citiesGrid = document.getElementById('citiesGrid');
    const officesList = document.getElementById('officesList');
    const citySearch = document.getElementById('citySearch');
    const contactForm = document.getElementById('contactForm');

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        
        if (currentMode === 'online') {
          onlineFields.style.display = 'block';
          offlineFields.style.display = 'none';
        } else {
          onlineFields.style.display = 'none';
          offlineFields.style.display = 'block';
        }
      });
    });

    officeSelectBtn.addEventListener('click', () => {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });

    function renderCities(filter = '') {
      const cities = Object.keys(officesData);
      citiesGrid.innerHTML = '';

      cities.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'city-btn';
        btn.textContent = city;
        btn.type = 'button';
        
        if (filter && !city.toLowerCase().includes(filter.toLowerCase())) {
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

        citiesGrid.appendChild(btn);
      });
    }

    function renderOffices(city) {
      const offices = officesData[city];
      officesList.innerHTML = '';

      const title = document.createElement('h3');
      title.className = 'offices-title';
      title.textContent = `Офисы в городе ${city}`;
      officesList.appendChild(title);

      offices.forEach(office => {
        const card = document.createElement('div');
        card.className = 'office-card';
        
        if (selectedOffice && selectedOffice.id === office.id) {
          card.classList.add('selected');
        }

        const nameEl = document.createElement('div');
        nameEl.className = 'office-name';
        nameEl.textContent = office.name;
        
        if (selectedOffice && selectedOffice.id === office.id) {
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
        mapBtn.textContent = '📍 Открыть на карте';
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

        actions.appendChild(mapBtn);
        actions.appendChild(selectBtn);

        card.appendChild(nameEl);
        card.appendChild(addressEl);
        card.appendChild(actions);

        card.addEventListener('click', () => {
          selectOffice(office);
        });

        officesList.appendChild(card);
      });
    }

    function selectOffice(office) {
      selectedOffice = office;
      selectedOfficeText.textContent = `${office.name} — ${office.address}`;
      officeSelectBtn.classList.add('selected');
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
      if (selectedCity) {
        renderOffices(selectedCity);
      }
    }

    citySearch.addEventListener('input', (e) => {
      renderCities(e.target.value);
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (currentMode === 'online') {
        const formData = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          service: document.getElementById('service').value,
          message: document.getElementById('message').value
        };
        console.log('Онлайн заявка:', formData);
        alert('Онлайн заявка отправлена!\nПроверьте консоль для деталей.');
      } else {
        if (!selectedOffice) {
          alert('Пожалуйста, выберите офис');
          return;
        }
        const formData = {
          name: document.getElementById('offlineName').value,
          phone: document.getElementById('phone').value,
          officeId: selectedOffice.id
        };
        console.log('Офлайн запись:', formData);
        alert(`Запись на приём оформлена!\nОфис: ${selectedOffice.name}\nID офиса: ${selectedOffice.id}\nПроверьте консоль для деталей.`);
      }
    });

    renderCities();
});