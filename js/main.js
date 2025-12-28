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

  /* 3. MOBILE MENU */
  const burgerBtn = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (burgerBtn && mobileMenu) {
    const toggleMenu = () => {
      burgerBtn.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    };

    const closeMenu = () => {
      burgerBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
    };

    burgerBtn.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  /* 4. MODAL & TERMINAL LOGIC */
  const aboutTrigger = document.getElementById('about-trigger');
  const aboutOverlay = document.getElementById('about-overlay');
  const closeAbout = document.getElementById('close-about');
  
  const cmdInput = document.getElementById('cmd-input');
  const sysResponse = document.getElementById('sys-response');
  const statusLine = document.getElementById('status-line');
  const statusRes = document.getElementById('status-res');

  let terminalTimers = [];

  const clearTerminal = () => {
    terminalTimers.forEach(t => clearTimeout(t));
    terminalTimers = [];
    
    if (cmdInput) {
      cmdInput.style.width = '0';
      cmdInput.style.transition = 'none';
      cmdInput.classList.remove('cursor-blink');
    }
    if (sysResponse) sysResponse.classList.remove('visible');
    if (statusLine) statusLine.classList.remove('visible');
    if (statusRes) statusRes.classList.remove('visible');
  };

  const typeText = (el, duration) => {
    el.style.transition = `width ${duration}ms steps(30, end)`;
    el.style.width = '100%';
    el.classList.add('cursor-blink');
  };

  if (aboutTrigger && aboutOverlay) {
    const openModal = () => {
      aboutOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      clearTerminal();
      void aboutOverlay.offsetWidth; // Trigger Reflow

      // Sequence
      terminalTimers.push(setTimeout(() => {
        if (cmdInput) typeText(cmdInput, 2000);
      }, 500));

      terminalTimers.push(setTimeout(() => {
        if (cmdInput) cmdInput.classList.remove('cursor-blink');
        if (sysResponse) sysResponse.classList.add('visible');
      }, 3500));

      terminalTimers.push(setTimeout(() => {
        if (statusLine) statusLine.classList.add('visible');
      }, 4500));

      terminalTimers.push(setTimeout(() => {
        if (statusRes) statusRes.classList.add('visible');
      }, 6000));
    };

    const closeModal = () => {
      aboutOverlay.classList.remove('active');
      document.body.style.overflow = '';
      clearTerminal();
    };

    aboutTrigger.addEventListener('click', openModal);
    
    if (closeAbout) closeAbout.addEventListener('click', closeModal);
    
    aboutOverlay.addEventListener('click', (e) => {
      if (e.target === aboutOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && aboutOverlay.classList.contains('active')) {
        closeModal();
      }
    });
  }
});