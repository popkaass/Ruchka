// Мобильное меню
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu = document.getElementById('closeMenu');
const menuOverlay = document.getElementById('menuOverlay');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        menuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (closeMenu) {
    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
}

if (menuOverlay) {
    menuOverlay.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Закрываем меню если открыто
            mobileMenu.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Прокрутка
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Анимация появления элементов
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Анимация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Наблюдатель для анимации
    document.querySelectorAll('.section-header, .shop-card, .link-card, .contact-card').forEach(el => {
        observer.observe(el);
    });
    
    // Добавляем стили для анимации
    const animateStyle = document.createElement('style');
    animateStyle.textContent = `
        .animate-in {
            animation: fadeInUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Задержки для сетки ссылок */
        .link-card:nth-child(1) { animation-delay: 0.1s; }
        .link-card:nth-child(2) { animation-delay: 0.2s; }
        .link-card:nth-child(3) { animation-delay: 0.3s; }
        .link-card:nth-child(4) { animation-delay: 0.4s; }
        .link-card:nth-child(5) { animation-delay: 0.5s; }
        .link-card:nth-child(6) { animation-delay: 0.6s; }
    `;
    document.head.appendChild(animateStyle);
    
    // Эффект параллакса для героя
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero-background');
        
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    
    // Добавляем hover эффекты для кнопок
    const glowButtons = document.querySelectorAll('.btn-glow-pulse');
    glowButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            const glow = btn.querySelector('.glow-effect');
            if (glow) {
                glow.style.opacity = '0.8';
            }
        });
        
        btn.addEventListener('mouseleave', () => {
            const glow = btn.querySelector('.glow-effect');
            if (glow) {
                glow.style.opacity = '0.5';
            }
        });
    });
});

// Валидация ссылок (если нужно открывать в новом окне)
document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.target) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }
});

// Показать текущий год в футере
const yearElement = document.querySelector('.copyright');
if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.textContent = yearElement.textContent.replace('2023', currentYear);
}