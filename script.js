/* ========== LOADER ========== */
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 1500);
});

/* ========== BACKGROUND IMAGE SWITCHER ========== */
(function() {
    const images = document.querySelectorAll('.bg-image');
    if (images.length < 2) return;

    let current = 0;

    function switchBg() {
        images.forEach(img => img.classList.remove('active'));
        current = (current + 1) % images.length;
        images[current].classList.add('active');
    }

    setInterval(switchBg, 8000);
})();

/* ========== PARTICLE CANVAS ========== */
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouseX = -1000;
let mouseY = -1000;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedY = Math.random() * 0.4 + 0.05;
        this.speedX = Math.random() * 0.15 - 0.075;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.hue = Math.random() * 60 + 220;
        this.flicker = Math.random() * 0.03 + 0.01;
        this.flickerOffset = Math.random() * Math.PI * 2;
        this.life = Math.random() * 400 + 200;
        this.maxLife = this.life;
    }

    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.life--;

        // Mouse interaction
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
            const force = (150 - dist) / 150;
            this.x += dx * force * 0.015;
            this.y += dy * force * 0.015;
            this.opacity = Math.min(0.7, this.opacity + force * 0.2);
        }

        // Flicker glow
        const flickerVal = Math.sin(Date.now() * this.flicker * 0.001 + this.flickerOffset);
        this.opacity += flickerVal * 0.015;
        this.opacity = Math.max(0.05, Math.min(0.5, this.opacity));

        if (this.life <= 0 || this.y < -10) {
            this.reset();
            this.y = canvas.height + 10;
            this.x = Math.random() * canvas.width;
            this.life = this.maxLife;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 4
        );

        const alpha = this.opacity;

        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 75%, ${alpha})`);
        gradient.addColorStop(0.3, `hsla(${this.hue + 20}, 70%, 65%, ${alpha * 0.4})`);
        gradient.addColorStop(1, `hsla(${this.hue + 40}, 60%, 55%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

const particleCount = Math.min(100, Math.floor(window.innerWidth * 0.05));
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener('touchmove', (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', () => {
    mouseX = -1000;
    mouseY = -1000;
});

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animateParticles);
}

animateParticles();

/* ========== SCROLL PROGRESS BAR ========== */
const progressBar = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
});

/* ========== SECTION GLITCH TITLE TRIGGER ========== */
function triggerGlitchOnTitles() {
    document.querySelectorAll('.section-title').forEach(title => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    title.classList.add('glitch-visible');
                    // Remove class after animation completes so next visit retriggers
                    setTimeout(() => title.classList.remove('glitch-visible'), 1000);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(title);
    });
}
triggerGlitchOnTitles();

/* ========== SCROLL ANIMATIONS (enhanced) ========== */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const children = entry.target.querySelectorAll('.service-card, .project-card');
            if (children.length) {
                children.forEach((child, i) => {
                    setTimeout(() => {
                        child.classList.add('visible');
                    }, i * 100);
                });
            } else {
                entry.target.classList.add('visible');
            }
        }
    });
}, observerOptions);

document.querySelectorAll(
    '.service-card, .project-card, .section-header, .about-content, .contact-form, .contact-info, .hero-stats'
).forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

/* ========== COUNTER ANIMATION ========== */
function animateCounters() {
    const counters = document.querySelectorAll('.stat-num');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 40;
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current) + '+';
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + '+';
            }
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(updateCounter, 300); // small delay for dramatic effect
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        counterObserver.observe(counter);
    });
}

animateCounters();

/* ========== NAVBAR ========== */
const navbar = document.getElementById('navbar');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
    });
});

// Active link + scrolled class
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });

    // Scrolled class for glow
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Hide/show on scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 100) {
        navbar.style.transform = currentScroll > lastScroll ?
            'translateY(-100%)' : 'translateY(0)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll;
});

/* ========== FORM HANDLER ========== */
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const btn = this.querySelector('.btn');
    const originalText = btn.textContent;
    btn.textContent = 'Відправляємо...';
    btn.disabled = true;

    setTimeout(() => {
        btn.textContent = '✓ Відправлено!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.background = '';
            this.reset();
        }, 3000);
    }, 1500);
});

/* ========== SMOOTH SCROLL ========== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();

        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* ========== HERO TITLE TYPEWRITER FX (bonus) ========== */
// Small delay then add a subtle glow pulse to hero title
setTimeout(() => {
    const heroTitle = document.querySelector('.hero-title .gradient-text');
    if (heroTitle) {
        heroTitle.style.animation = '';
        // Force reflow
        void heroTitle.offsetWidth;
        heroTitle.style.animation = 'glitchNeon 0.8s ease-out 1';
    }
}, 2000);

console.log('✦ NEON VISION — Digital Agency');
console.log('✦ Зроблено з технологічною душею ⚡');
