   // Навигация слайдов
        let currentSlide = 0;
        const totalSlides = 2;
        const slidesWrapper = document.querySelector('.slides-wrapper');
        const dots = document.querySelectorAll('.slide-dot');
        let isAnimating = false;

        function goToSlide(index) {
            if (isAnimating || index === currentSlide || index < 0 || index >= totalSlides) return;
            isAnimating = true;
            currentSlide = index;

            slidesWrapper.style.transform = `translateY(-${currentSlide * 100}vh)`;

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });

            // Анимация счётчиков на слайде 2
            if (currentSlide === 1) {
                document.querySelector('.slide-stats').classList.add('active');
                animateCounters();
            }

            setTimeout(() => { isAnimating = false; }, 800);
        }

        // Клик по точкам
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.dataset.slide);
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    const targetSlide = document.getElementById('slide-' + slideIndex);
                    if (targetSlide) {
                        targetSlide.scrollIntoView({ behavior: 'smooth' });
                    }
                    dots.forEach((d, i) => {
                        d.classList.toggle('active', i === slideIndex);
                    });
                    if (slideIndex === 1) {
                        document.querySelector('.slide-stats').classList.add('active');
                        setTimeout(() => animateCounters(), 400);
                    }
                } else {
                    goToSlide(slideIndex);
                }
            });
        });

        // Проверка открыто ли модальное окно
        function isModalOpen() {
            return document.querySelector('.modal-overlay.active') !== null;
        }

        // Навигация клавиатурой
        document.addEventListener('keydown', (e) => {
            if (isModalOpen()) return;
            
            if (e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                goToSlide(currentSlide + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                goToSlide(currentSlide - 1);
            }
        });

        // Навигация колёсиком мыши
        let wheelTimeout;
        document.addEventListener('wheel', (e) => {
            if (isModalOpen()) return;
            if (wheelTimeout) return;
            wheelTimeout = setTimeout(() => { wheelTimeout = null; }, 800);

            if (e.deltaY > 0) {
                goToSlide(currentSlide + 1);
            } else {
                goToSlide(currentSlide - 1);
            }
        }, { passive: true });

        // Навигация свайпом
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (isModalOpen()) return;
            
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToSlide(currentSlide + 1);
                } else {
                    goToSlide(currentSlide - 1);
                }
            }
        });

        // Анимация счётчиков
        function animateCounters() {
            const counters = document.querySelectorAll('.counter');
            counters.forEach(counter => {
                const target = parseFloat(counter.dataset.target);
                const isDecimal = counter.dataset.decimal === 'true';
                const duration = 2000;
                const start = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = target * easeOut;
                    counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
                    if (progress < 1) requestAnimationFrame(update);
                }
                requestAnimationFrame(update);
            });
        }

        // Модальные окна
        function openModal(id) {
            document.getElementById(id).classList.add('active');
            const scrollY = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.dataset.scrollY = scrollY;
        }

        function closeModal(id) {
            document.getElementById(id).classList.remove('active');
            const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        }

        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal-overlay')) {
                    closeModal(modal.id);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModals = document.querySelectorAll('.modal-overlay.active');
                if (activeModals.length > 0) {
                    // Если открыто модальное окно — закрываем его
                    activeModals.forEach(m => closeModal(m.id));
                } else {
                    // Если модальных окон нет — переходим на главную страницу
                    const closeBtn = document.querySelector('.page-close-btn');
                    if (closeBtn) {
                        glitchTransition.classList.add('active');
                        setTimeout(() => { window.location = closeBtn.href; }, 600);
                    }
                }
            }
        });

        // Сеть частиц
        const canvas = document.getElementById('particles-canvas');
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 80;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(168, 213, 226, 0.5)';
                ctx.fill();

                // Соединение ближайших частиц
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(168, 213, 226, ${0.2 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(drawParticles);
        }

        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticles();
        });

        resizeCanvas();
        createParticles();
        drawParticles();

        // Функция прокрутки к слайду 2 (для мобильных)
        function scrollToSlide2() {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                const slide2 = document.getElementById('slide-1');
                if (slide2) {
                    slide2.scrollIntoView({ behavior: 'smooth' });
                    document.querySelector('.slide-stats').classList.add('active');
                    setTimeout(() => animateCounters(), 400);
                }
            } else {
                goToSlide(1);
            }
        }

        // Автоматический переход между слайдами при прокрутке (для мобильных)
        function initMobileScrollSnap() {
            if (window.innerWidth > 768) return;

            const slide1 = document.getElementById('slide-0');
            const slide2 = document.getElementById('slide-1');
            const descriptionBox = slide1.querySelector('.description-box');
            
            let lastScrollY = window.scrollY;
            let scrollTimeout;

            window.addEventListener('scroll', () => {
                if (isModalOpen()) return;
                
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const scrollY = window.scrollY;
                    const windowHeight = window.innerHeight;
                    
                    // Получаем позиции элементов
                    const descBoxRect = descriptionBox.getBoundingClientRect();
                    const slide2Rect = slide2.getBoundingClientRect();
                    
                    // Обновляем активную точку в зависимости от позиции
                    if (slide2Rect.top < windowHeight / 2) {
                        dots.forEach((d, i) => d.classList.toggle('active', i === 1));
                    } else {
                        dots.forEach((d, i) => d.classList.toggle('active', i === 0));
                    }
                    
                    // Если нижняя часть экрана достигла нижней точки карточки на слайде 1 + 30px
                    if (descBoxRect.bottom <= windowHeight - 30 && descBoxRect.bottom > 0) {
                        // Прокрутка вниз — переход на слайд 2
                        if (scrollY > lastScrollY) {
                            slide2.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                    
                    // Если верхняя часть экрана достигла верхней карточки на слайде 2 + 30px
                    if (slide2Rect.top >= 30 && slide2Rect.top < windowHeight) {
                        // Прокрутка вверх — переход на слайд 1
                        if (scrollY < lastScrollY) {
                            slide1.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                    
                    lastScrollY = scrollY;
                }, 100);
            }, { passive: true });
        }

        // Инициализация мобильного snap-скролла
        initMobileScrollSnap();
        window.addEventListener('resize', initMobileScrollSnap);

        // Переход между страницами
        const glitchTransition = document.querySelector('.glitch-transition');

        window.addEventListener('load', () => {
            setTimeout(() => {
                glitchTransition.querySelectorAll('.glitch-slice').forEach(slice => {
                    slice.style.animation = 'none';
                    slice.style.transform = 'translateX(100%)';
                });
            }, 100);
        });