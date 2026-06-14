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

        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
            const force = (150 - dist) / 150;
            this.x += dx * force * 0.015;
            this.y += dy * force * 0.015;
            this.opacity = Math.min(0.7, this.opacity + force * 0.2);
        }

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

        gradient.addColorStop(0, `hsla(${this.hue}, 80%, 75%, ${this.opacity})`);
        gradient.addColorStop(0.3, `hsla(${this.hue + 20}, 70%, 65%, ${this.opacity * 0.4})`);
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
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* ========== MOUSE TRAIL SPARKLES ========== */
const trailCanvas = document.getElementById('mouseTrailCanvas');
const trailCtx = trailCanvas.getContext('2d');

let trailParticles = [];

function resizeTrailCanvas() {
    trailCanvas.width = window.innerWidth;
    trailCanvas.height = window.innerHeight;
}
resizeTrailCanvas();
window.addEventListener('resize', resizeTrailCanvas);

class TrailSpark {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        this.size = Math.random() * 3 + 1;
        this.hue = Math.random() * 60 + 220;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.98;
    }

    draw() {
        if (this.life <= 0) return;
        trailCtx.beginPath();
        trailCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        trailCtx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.life * 0.6})`;
        trailCtx.fill();

        trailCtx.beginPath();
        trailCtx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        trailCtx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.life * 0.1})`;
        trailCtx.fill();
    }
}

let lastTrailTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime < 40) return;
    lastTrailTime = now;

    for (let i = 0; i < 3; i++) {
        trailParticles.push(new TrailSpark(e.clientX, e.clientY));
    }
    if (trailParticles.length > 120) {
        trailParticles = trailParticles.slice(-80);
    }
});

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const now = Date.now();
    if (now - lastTrailTime < 60) return;
    lastTrailTime = now;

    for (let i = 0; i < 2; i++) {
        trailParticles.push(new TrailSpark(touch.clientX, touch.clientY));
    }
}, { passive: true });

function animateTrail() {
    trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

    trailParticles = trailParticles.filter(p => p.life > 0);
    trailParticles.forEach(p => { p.update(); p.draw(); });

    requestAnimationFrame(animateTrail);
}
animateTrail();

/* ========== NEW 24: CURSOR GLOW ORB ========== */
const cursorGlow = document.getElementById('cursorGlow');
let cursorX = 0, cursorY = 0;
let glowX = 0, glowY = 0;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursorGlow.style.opacity = '1';
});

document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
});

document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    cursorX = touch.clientX;
    cursorY = touch.clientY;
    cursorGlow.style.opacity = '1';
});

document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    cursorX = touch.clientX;
    cursorY = touch.clientY;
}, { passive: true });

document.addEventListener('touchend', () => {
    cursorGlow.style.opacity = '0';
});

function animateCursorGlow() {
    glowX += (cursorX - glowX) * 0.08;
    glowY += (cursorY - glowY) * 0.08;
    cursorGlow.style.transform = `translate(${glowX - 150}px, ${glowY - 150}px)`;
    requestAnimationFrame(animateCursorGlow);
}
animateCursorGlow();

/* ========== NEW 25: LIQUID SWIPE ON CARDS ========== */
(function() {
    document.querySelectorAll(
        '.service-card, .project-card, .about-content, .contact-form, .contact-info'
    ).forEach(card => {
        const swipe = document.createElement('div');
        swipe.className = 'liquid-swipe';
        const fill = document.createElement('div');
        fill.className = 'liquid-fill';
        swipe.appendChild(fill);
        card.appendChild(swipe);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
            fill.style.setProperty('--liquid-angle', `${angle}deg`);
        });
    });
})();

/* ========== NEW 26: SCROLL EQ BARS ========== */
const eqCanvas = document.getElementById('eqCanvas');
const eqCtx = eqCanvas.getContext('2d');
let eqBars = [];

function initEq() {
    eqCanvas.width = window.innerWidth;
    eqCanvas.height = 80;
    const count = Math.floor(window.innerWidth / 6);
    eqBars = [];
    for (let i = 0; i < count; i++) {
        eqBars.push({
            height: Math.random() * 30 + 5,
            target: Math.random() * 30 + 5,
            speed: Math.random() * 0.03 + 0.01,
        });
    }
}
initEq();
window.addEventListener('resize', initEq);

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollY / docHeight : 0;

    eqBars.forEach((bar, i) => {
        const wave = Math.sin(Date.now() * 0.002 + i * 0.3) * 0.3;
        bar.target = 10 + progress * 60 + wave * 20;
    });
});

function animateEq() {
    eqCtx.clearRect(0, 0, eqCanvas.width, eqCanvas.height);

    const centerY = eqCanvas.height / 2;
    const barWidth = eqCanvas.width / eqBars.length;

    eqBars.forEach((bar, i) => {
        bar.height += (bar.target - bar.height) * bar.speed;

        const x = i * barWidth;
        const w = barWidth - 2;
        const h = bar.height;

        // Glow
        const hue = 220 + (h / 70) * 60;
        const grad = eqCtx.createLinearGradient(x, centerY - h, x, centerY + h);
        grad.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.15)`);
        grad.addColorStop(0.5, `hsla(${hue + 20}, 70%, 55%, 0.25)`);
        grad.addColorStop(1, `hsla(${hue + 40}, 60%, 50%, 0.15)`);

        eqCtx.fillStyle = grad;
        eqCtx.fillRect(x, centerY - h / 2, w, h);

        // Glow border
        eqCtx.fillStyle = `hsla(${hue}, 80%, 70%, 0.08)`;
        eqCtx.shadowColor = `hsla(${hue}, 80%, 60%, 0.1)`;
        eqCtx.shadowBlur = 5;
        eqCtx.fillRect(x, centerY - h / 2, w, h);
        eqCtx.shadowBlur = 0;
    });

    requestAnimationFrame(animateEq);
}
animateEq();

/* ========== NEW 27: AMBIENT TIME THEME ========== */
(function() {
    const hour = new Date().getHours();
    const body = document.body;

    if (hour >= 22 || hour < 5) {
        body.classList.add('ambient-night');
    } else if (hour >= 10 && hour < 17) {
        body.classList.add('ambient-day');
    }
})();

/* ========== NEW 28: MAGNETIC BUTTONS ========== */
(function() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const dist = Math.sqrt(x * x + y * y);
            const maxDist = Math.max(rect.width, rect.height);
            const strength = Math.min(1, 1 - dist / maxDist) * 5;

            btn.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px) scale(1.02)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
})();

/* ========== NEW 29: NEON RAIN ========== */
(function() {
    const container = document.getElementById('rainContainer');
    if (!container) return;
    const dropCount = 40;

    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.height = (Math.random() * 60 + 30) + 'px';
        drop.style.animationDuration = (Math.random() * 2 + 1.5) + 's';
        drop.style.animationDelay = (Math.random() * 5) + 's';
        drop.style.opacity = Math.random() * 0.4 + 0.1;

        // Random neon color
        const colors = ['rgba(99,102,241,0.15)', 'rgba(236,72,153,0.12)', 'rgba(6,182,212,0.1)']; 
            const c = colors[Math.floor(Math.random() * colors.length)];
            const parts = c.slice(0, -1);
        drop.style.background = `linear-gradient(to bottom, transparent, ${parts}0.4) 0%, ${parts}0.1) 100%)`;

        container.appendChild(drop);
    }
})();

/* ========== HERO TEXT MORPHING ========== */
(function() {
    const morphEl = document.querySelector('.morph-word');
    if (!morphEl) return;
    const words = JSON.parse(morphEl.getAttribute('data-words') || '[]');
    if (words.length < 2) return;

    let index = 0;

    function morphText() {
        index = (index + 1) % words.length;
        morphEl.style.opacity = '0';
        morphEl.style.transform = 'translateY(-8px)';

        setTimeout(() => {
            morphEl.textContent = words[index];
            morphEl.style.opacity = '1';
            morphEl.style.transform = 'translateY(0)';
        }, 400);
    }

    setInterval(morphText, 4000);
    morphEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
})();

/* ========== SCROLL PROGRESS BAR ========== */
const progressBar = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
});

/* ========== WAVE PARALLAX ON SCROLL ========== */
(function() {
    const waves = document.querySelectorAll('.wave');
    if (!waves.length) return;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        waves.forEach((wave, i) => {
            const speed = 0.02 + (i * 0.015);
            wave.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });
})();

/* ========== WAVE ON MOUSE MOVE ========== */
(function() {
    const waves = document.querySelectorAll('.wave');
    if (!waves.length) return;

    document.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        waves.forEach((wave, i) => {
            wave.style.setProperty('--wave-move', `${x * (5 + i * 3)}px`);
        });
    });
})();

/* ========== SECTION GLITCH TITLE TRIGGER ========== */
function triggerGlitchOnTitles() {
    document.querySelectorAll('.section-title').forEach(title => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    title.classList.add('glitch-visible');
                    setTimeout(() => title.classList.remove('glitch-visible'), 1000);
                }
            });
        }, { threshold: 0.3 });
        observer.observe(title);
    });
}
triggerGlitchOnTitles();

/* ========== SCROLL ANIMATIONS ========== */
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

document.querySelectorAll('section').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

/* ========== COUNTER ANIMATION ========== */
function animateCounters() {
    const counters = document.querySelectorAll('.stat-num');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));

        const updateCounter = () => {
            const increment = target / 40;
            let current = 0;
            const timer = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.ceil(current) + '+';
                    requestAnimationFrame(timer);
                } else {
                    counter.textContent = target + '+';
                }
            };
            timer();
        };

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(updateCounter, 400);
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

    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
        navbar.style.transform = currentScroll > lastScroll ? 'translateY(-100%)' : 'translateY(0)';
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

/* ========== HERO TITLE INITIAL GLITCH ========== */
setTimeout(() => {
    const heroTitle = document.querySelector('.hero-title .hero-morph .morph-word');
    if (heroTitle) {
        heroTitle.style.animation = '';
        void heroTitle.offsetWidth;
    }
}, 2000);

/* ========== KONAMI CODE EASTER EGG ========== */
(function() {
    const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let pos = 0;

    document.addEventListener('keydown', (e) => {
        if (e.keyCode === konami[pos]) {
            pos++;
            if (pos === konami.length) {
                pos = 0;

                // Party mode!
                document.body.style.animation = 'none';
                document.querySelectorAll('.bg-image, .bg-overlay, .bokeh-overlay').forEach(el => {
                    el.style.animation = 'none';
                });

                // Rainbow flash
                const flash = document.createElement('div');
                flash.style.cssText = 'position:fixed;inset:0;z-index:10000;pointer-events:none;transition:opacity 3s';
                flash.style.background = 'linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff)';
                flash.style.backgroundSize = '400% 400%';
                flash.style.animation = 'progressPulse 2s ease infinite, borderMorph 2s ease infinite';
                flash.style.opacity = '0.15';
                document.body.appendChild(flash);

                // Display message
                const msg = document.createElement('div');
                msg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10001;font-size:3rem;font-weight:900;pointer-events:none;text-align:center';
                msg.innerHTML = '⚡ NEON MODE UNLOCKED ⚡<br><span style="font-size:1rem;opacity:0.6">Вітаємо в матриці</span>';
                msg.style.background = 'linear-gradient(135deg,#6366f1,#ec4899,#f59e0b)';
                msg.style.webkitBackgroundClip = 'text';
                msg.style.webkitTextFillColor = 'transparent';
                document.body.appendChild(msg);

                setTimeout(() => {
                    flash.style.opacity = '0';
                    msg.style.opacity = '0';
                    msg.style.transition = 'opacity 2s';
                    setTimeout(() => {
                        flash.remove();
                        msg.remove();
                    }, 2000);
                }, 3000);
            }
        } else {
            pos = 0;
        }
    });
})();

console.log('✦ NEON VISION — Digital Agency');
console.log('✦ Зроблено з технологічною душею ⚡');
console.log('✦ Спробуй Konami Code: ↑↑↓↓←→←→BA');
