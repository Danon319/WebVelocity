/* =========================================================
   1. ДИНАМИЧЕСКИЙ --dvh (для мобильных браузеров)
   FIX: visualViewport и window оба вызывали updateVh при resize —
        один из них лишний. Оставляем только visualViewport (точнее),
        с fallback на window.resize если visualViewport недоступен.
========================================================= */
(function () {
  function updateVh() {
    const h = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;
    document.documentElement.style.setProperty('--dvh', h * 0.01 + 'px');
  }

  updateVh();

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateVh);
  } else {
    window.addEventListener('resize', updateVh);
  }

  // Orientationchange нужен отдельно — браузер может не успеть
  window.addEventListener('orientationchange', () => setTimeout(updateVh, 200));
})();


/* =========================================================
   2. ТЕМА: применяем сохранённое значение до рендера
========================================================= */
(function () {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
})();


/* =========================================================
   Основная логика страницы
========================================================= */
(function () {
  /* --- Кешированные DOM-ссылки --- */
  const slidesWrapper  = document.querySelector('.slides-wrapper');
  const slideStatsEl   = document.querySelector('.slide-stats');
  const dotsAll        = document.querySelectorAll('.slide-dot');
  const glitchTransition = document.querySelector('.glitch-transition');

  const TOTAL_SLIDES   = 2;
  const ANIM_DURATION  = 800; // мс — должна совпадать с CSS transition

  let currentSlide = 0;
  let isAnimating  = false;

  // FIX: счётчики запускаются только один раз
  let countersAnimated = false;


  /* =========================================================
     3. НАВИГАЦИЯ СЛАЙДОВ
  ========================================================= */
  function goToSlide(index) {
    if (isAnimating || index === currentSlide || index < 0 || index >= TOTAL_SLIDES) return;

    isAnimating  = true;
    currentSlide = index;

    slidesWrapper.style.transform = `translateY(-${currentSlide * 100}vh)`;

    // FIX: classList.toggle с булевым аргументом — нет forEach+if
    dotsAll.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-current', i === currentSlide ? 'true' : 'false');
    });

    if (currentSlide === 1) activateStatsSlide();

    setTimeout(() => { isAnimating = false; }, ANIM_DURATION);
  }

  function activateStatsSlide() {
    slideStatsEl.classList.add('active');
    if (!countersAnimated) {
      countersAnimated = true;
      animateCounters();
    }
  }


  /* --- Точки навигации --- */
  dotsAll.forEach(dot => {
    dot.addEventListener('click', () => {
      const slideIndex = parseInt(dot.dataset.slide, 10);

      if (window.innerWidth <= 768) {
        // Мобильный: scrollIntoView
        document.getElementById('slide-' + slideIndex)
          ?.scrollIntoView({ behavior: 'smooth' });

        dotsAll.forEach((d, i) => d.classList.toggle('active', i === slideIndex));

        if (slideIndex === 1) {
          slideStatsEl.classList.add('active');
          if (!countersAnimated) {
            setTimeout(() => {
              countersAnimated = true;
              animateCounters();
            }, 400);
          }
        }
      } else {
        goToSlide(slideIndex);
      }
    });
  });


  /* =========================================================
     4. ПРОКРУТКА К СЛАЙДУ 2 (вызывается из HTML onclick)
     FIX: функция переехала внутрь IIFE, но остаётся глобальной
          через window — HTML использует onclick="scrollToSlide2()"
  ========================================================= */
  window.scrollToSlide2 = function () {
    if (window.innerWidth <= 768) {
      const slide2 = document.getElementById('slide-1');
      if (!slide2) return;
      slide2.scrollIntoView({ behavior: 'smooth' });
      slideStatsEl.classList.add('active');
      if (!countersAnimated) {
        setTimeout(() => {
          countersAnimated = true;
          animateCounters();
        }, 400);
      }
    } else {
      goToSlide(1);
    }
  };


  /* =========================================================
     5. МОБИЛЬНЫЙ SCROLL-SNAP
     FIX: каждый вызов initMobileScrollSnap добавлял НОВЫЙ
          'scroll'-обработчик. Теперь используем один постоянный
          обработчик, который проверяет ширину экрана сам.
  ========================================================= */
  {
    const slide1El      = document.getElementById('slide-0');
    const slide2El      = document.getElementById('slide-1');
    const descriptionBox = slide1El?.querySelector('.description-box');

    let lastScrollY    = window.scrollY;
    let scrollTimeout;

    window.addEventListener('scroll', () => {
      // Игнорируем на десктопе и при открытом модальном
      if (window.innerWidth > 768 || isModalOpen()) return;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollY      = window.scrollY;
        const windowHeight = window.innerHeight;

        const descBoxRect = descriptionBox?.getBoundingClientRect();
        const slide2Rect  = slide2El?.getBoundingClientRect();

        if (!descBoxRect || !slide2Rect) return;

        // Обновляем активную точку
        const isOnSlide2 = slide2Rect.top < windowHeight / 2;
        dotsAll.forEach((d, i) => d.classList.toggle('active', i === (isOnSlide2 ? 1 : 0)));

        // Snap вниз
        if (descBoxRect.bottom <= windowHeight - 30 && descBoxRect.bottom > 0 && scrollY > lastScrollY) {
          slide2El.scrollIntoView({ behavior: 'smooth' });
        }

        // Snap вверх
        if (slide2Rect.top >= 30 && slide2Rect.top < windowHeight && scrollY < lastScrollY) {
          slide1El.scrollIntoView({ behavior: 'smooth' });
        }

        lastScrollY = scrollY;
      }, 100);
    }, { passive: true });
  }


  /* =========================================================
     6. АНИМАЦИЯ СЧЁТЧИКОВ
     FIX: защита от повторного запуска через флаг countersAnimated
  ========================================================= */
  function animateCounters() {
    document.querySelectorAll('.counter').forEach(counter => {
      const target    = parseFloat(counter.dataset.target);
      const isDecimal = counter.dataset.decimal === 'true';
      const duration  = 2000;
      const start     = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const easeOut  = 1 - Math.pow(1 - progress, 3);
        counter.textContent = isDecimal
          ? (target * easeOut).toFixed(1)
          : Math.floor(target * easeOut);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }


  /* =========================================================
     7. МОДАЛЬНЫЕ ОКНА
  ========================================================= */
  // FIX: isModalOpen — кешируем selector строку, не вызываем
  //      querySelector каждый раз (оставляем querySelector т.к.
  //      DOM меняется, но делаем проверку атрибута быстрее)
  function isModalOpen() {
    return !!document.querySelector('.modal-overlay.active');
  }

  // Экспонируем openModal / closeModal глобально (вызываются из onclick в HTML)
  window.openModal = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Закрытие по клику на фон
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) window.closeModal(modal.id);
    });
  });


  /* =========================================================
     8. СЕТЬ ЧАСТИЦ (Canvas)
     FIX: тема читалась каждый кадр (getAttribute внутри loop) —
          кешируем флаг isLight и обновляем его через MutationObserver
  ========================================================= */
  {
    const canvas       = document.getElementById('particles-canvas');
    if (canvas) {
      const ctx          = canvas.getContext('2d');
      const PARTICLE_COUNT = 80;
      const LINK_DIST      = 120;
      let particles      = [];
      let isLight        = document.documentElement.getAttribute('data-theme') === 'light';
      let rafId;

      // FIX: обновляем кеш темы без опроса в каждом кадре
      new MutationObserver(() => {
        isLight = document.documentElement.getAttribute('data-theme') === 'light';
      }).observe(document.documentElement, { attributeFilter: ['data-theme'] });

      function resizeCanvas() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      function createParticles() {
        particles = Array.from({ length: PARTICLE_COUNT }, () => ({
          x:      Math.random() * canvas.width,
          y:      Math.random() * canvas.height,
          vx:     (Math.random() - 0.5) * 0.5,
          vy:     (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
        }));
      }

      function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // FIX: кешируем цвет вне цикла — одно чтение на кадр
        const color = isLight ? '243, 166, 131' : '168, 213, 226';

        particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, 0.5)`;
          ctx.fill();

          // Линии между близкими частицами
          for (let j = i + 1; j < particles.length; j++) {
            const q    = particles[j];
            const dist = Math.hypot(p.x - q.x, p.y - q.y);
            if (dist < LINK_DIST) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = `rgba(${color}, ${0.2 * (1 - dist / LINK_DIST)})`;
              ctx.lineWidth   = 0.5;
              ctx.stroke();
            }
          }
        });

        rafId = requestAnimationFrame(drawParticles);
      }

      // FIX: одна точка resize для canvas
      let canvasResizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(canvasResizeTimeout);
        canvasResizeTimeout = setTimeout(() => {
          resizeCanvas();
          createParticles();
        }, 150);
      });

      resizeCanvas();
      createParticles();
      drawParticles();
    }
  }


  /* =========================================================
     9. ПЕРЕХОД МЕЖДУ СТРАНИЦАМИ (Glitch-эффект)
  ========================================================= */
  window.addEventListener('load', () => {
    if (!glitchTransition) return;
    setTimeout(() => {
      glitchTransition.querySelectorAll('.glitch-slice').forEach(slice => {
        slice.style.animation  = 'none';
        slice.style.transform  = 'translateX(100%)';
      });
    }, 100);
  });


  /* =========================================================
     10. ЕДИНЫЙ ОБРАБОТЧИК КЛАВИАТУРЫ
     FIX: было два отдельных document.addEventListener('keydown')
          — объединены в один switch
  ========================================================= */
  document.addEventListener('keydown', (e) => {
    const modalOpen = isModalOpen();

    switch (e.key) {
      case 'Escape':
        if (modalOpen) {
          // Закрываем все активные модалки
          document.querySelectorAll('.modal-overlay.active')
            .forEach(m => window.closeModal(m.id));
        } else {
          // Возврат на главную через glitch-переход
          const closeBtn = document.querySelector('.page-close-btn');
          if (closeBtn && glitchTransition) {
            glitchTransition.classList.add('active');
            setTimeout(() => { window.location = closeBtn.href; }, 600);
          }
        }
        break;

      case 'ArrowDown':
      case ' ':
        if (!modalOpen) {
          e.preventDefault();
          goToSlide(currentSlide + 1);
        }
        break;

      case 'ArrowUp':
        if (!modalOpen) {
          e.preventDefault();
          goToSlide(currentSlide - 1);
        }
        break;
    }
  });


  /* =========================================================
     11. НАВИГАЦИЯ КОЛЁСИКОМ (wheel)
     FIX: wheelTimeout через setTimeout/clearTimeout уже корректен,
          оставляем без изменений, добавляем только проверку ширины экрана
  ========================================================= */
  let wheelTimeout;
  document.addEventListener('wheel', (e) => {
    if (isModalOpen() || window.innerWidth <= 768) return;
    if (wheelTimeout) return;

    wheelTimeout = setTimeout(() => { wheelTimeout = null; }, ANIM_DURATION);
    e.deltaY > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
  }, { passive: true });


  /* =========================================================
     12. НАВИГАЦИЯ СВАЙПОМ (touch)
  ========================================================= */
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (isModalOpen()) return;
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) diff > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
  }, { passive: true });

})();