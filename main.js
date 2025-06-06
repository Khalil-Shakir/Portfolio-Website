// --- Three.js 3D Model (rotating cube) ---
const canvas = document.getElementById('threeCanvas');
if (canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 3;

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0x4ea8de, 0.8);
    directional.position.set(2, 2, 5);
    scene.add(directional);

    // Cube geometry
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0x4ea8de,
        metalness: 0.5,
        roughness: 0.3
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Animate
    function animate() {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.013;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // Responsive resize
    function resize3D() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize3D);
    resize3D();
}

// --- Scroll Line and Section Reveal ---
const scrollLine = document.getElementById('scrollLine');
const sections = document.querySelectorAll('.section');

function updateScrollLine() {
    const scrollY = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const percent = Math.min(scrollY / docHeight, 1);
    scrollLine.style.height = (percent * 100) + 'vh';

    // Reveal sections as scroll line passes them
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * percent + 100) {
            section.classList.add('visible');
        }
    });
}
window.addEventListener('scroll', updateScrollLine);
window.addEventListener('resize', updateScrollLine);
document.addEventListener('DOMContentLoaded', () => {
    updateScrollLine();
    // Initial reveal for first section
    setTimeout(() => {
        sections[0].classList.add('visible');
    }, 200);
});

// --- Particles Effect for Hero Section ---
const particlesCanvas = document.getElementById('heroParticles');
if (particlesCanvas) {
    const ctx = particlesCanvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 60;
    let mouse = { x: null, y: null, radius: 100 };

    function resizeParticlesCanvas() {
        const hero = document.querySelector('.hero');
        particlesCanvas.width = hero.offsetWidth;
        particlesCanvas.height = hero.offsetHeight;
    }
    resizeParticlesCanvas();
    window.addEventListener('resize', resizeParticlesCanvas);

    function Particle() {
        this.x = Math.random() * particlesCanvas.width;
        this.y = Math.random() * particlesCanvas.height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.size = 2 + Math.random() * 2;
        this.baseSize = this.size;
        this.color = 'rgba(78,168,222,0.7)';
    }
    Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    };
    Particle.prototype.update = function () {
        // Move
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on edges
        if (this.x < 0 || this.x > particlesCanvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > particlesCanvas.height) this.vy *= -1;

        // Interactivity
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius && dist > 0) {
            // Repel
            let angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * 2;
            this.y -= Math.sin(angle) * 2;
            this.size = this.baseSize + 2;
        } else {
            this.size = this.baseSize;
        }
        this.draw();
    };

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 90) {
                    ctx.strokeStyle = 'rgba(78,168,222,0.15)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        connectParticles();
        requestAnimationFrame(animateParticles);
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(new Particle());
        }
    }
    initParticles();
    animateParticles();

    particlesCanvas.addEventListener('mousemove', function (e) {
        const rect = particlesCanvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.radius = 120;
    });
    particlesCanvas.addEventListener('mouseleave', function () {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        resizeParticlesCanvas();
        initParticles();
    });
}

// --- Floating, autohide navbar with menu button and close button ---
const header = document.getElementById('mainHeader');
let lastScrollY = window.scrollY;
let navbarVisible = true;
let hideTimeout = null;

// Update showNavbar and hideNavbar to toggle .active for transitions
function showNavbar() {
    header.classList.remove('hide-navbar', 'navbar-slide-out');
    header.classList.add('navbar-slide-in');
    navbarVisible = true;
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
        if (!header.matches(':hover')) hideNavbar();
    }, 2500);

    header.addEventListener('animationend', function handler(e) {
        if (e.animationName === 'navbarSlideIn') {
            header.classList.remove('navbar-slide-in');
            header.removeEventListener('animationend', handler);
        }
    });
}

function hideNavbar() {
    header.classList.remove('navbar-slide-in');
    header.classList.add('navbar-slide-out');
    navbarVisible = false;

    header.addEventListener('animationend', function handler(e) {
        if (e.animationName === 'navbarSlideOut') {
            header.classList.add('hide-navbar');
            header.classList.remove('navbar-slide-out');
            header.removeEventListener('animationend', handler);
        }
    });
}

// Hide on scroll down, show on scroll up
window.addEventListener('scroll', () => {
    if (window.scrollY < 10) {
        showNavbar();
        return;
    }
    if (window.scrollY > lastScrollY && navbarVisible) {
        hideNavbar();
    } else if (window.scrollY < lastScrollY && !navbarVisible) {
        showNavbar();
    }
    lastScrollY = window.scrollY;
});

// Hide initially if not at top
document.addEventListener('DOMContentLoaded', () => {
    // Instantly hide both buttons to prevent flicker
    // menuBtn.style.display = 'none';
    // closeBtn.style.display = 'none';

    // Wait for layout, then show correct button
    setTimeout(() => {
        if (window.scrollY > 10) {
            hideNavbar();
        } else {
            header.classList.remove('hide-navbar');
            navbarVisible = true;
        }
    }, -100);
});

// --- Reveal 3D Elements ---
document.addEventListener('DOMContentLoaded', () => {
    const animatedEls = document.querySelectorAll('.animated-3d');
    function reveal3dElements() {
        animatedEls.forEach((el, i) => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 60) {
                setTimeout(() => el.classList.add('visible'), i * 10); // stagger
            }
        });
    }
    window.addEventListener('scroll', reveal3dElements);
    window.addEventListener('resize', reveal3dElements);
    reveal3dElements();
});

// --- Typewriter Effect ---
const words = [
    "HELLO, I AM KHALIL SHAKIR",
    "WEB DEVELOPER",
    "3D ENTHUSIAST",
    "UI/UX DESIGNER",
    "REACT SPECIALIST",
    "CREATIVE CODER"
];
let twIndex = 0, charIndex = 0, isDeleting = false;
const twElem = document.getElementById('typewriter');

function typeWriter() {
    const word = words[twIndex];
    if (isDeleting) {
        charIndex--;
        twElem.textContent = word.substring(0, charIndex);
        if (charIndex === 0) {
            isDeleting = false;
            twIndex = (twIndex + 1) % words.length;
            setTimeout(typeWriter, 700);
        } else {
            setTimeout(typeWriter, 40);
        }
    } else {
        charIndex++;
        twElem.textContent = word.substring(0, charIndex);
        if (charIndex === word.length) {
            isDeleting = true;
            setTimeout(typeWriter, 1200);
        } else {
            setTimeout(typeWriter, 80);
        }
    }
}
document.addEventListener('DOMContentLoaded', typeWriter);

// --- Hero Ball & Crosses Animation ---
(function () {
    const canvas = document.getElementById('heroBallCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }
    resize();
    window.addEventListener('resize', resize);

    // Crosses
    const crosses = [];
    const crossCount = 5;
    const crossSpacing = width / (crossCount + 1);
    for (let i = 0; i < crossCount; i++) {
        crosses.push({
            x: (i + 1) * crossSpacing,
            y: height - 60,
            size: 36,
            angle: 0,
            rotating: false
        });
    }

    // Ball
    let ball = {
        x: width / 2,
        y: 60,
        r: 22,
        vy: 0,
        gravity: 0.7,
        bounce: -0.65,
        color: "#4ea8de",
        isFalling: true
    };

    function resetBall() {
        ball.x = width / 2;
        ball.y = 60;
        ball.vy = 0;
        ball.isFalling = true;
    }

    function drawCross(cross) {
        ctx.save();
        ctx.translate(cross.x, cross.y);
        ctx.rotate(cross.angle);
        ctx.strokeStyle = "#22223b";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(-cross.size / 2, 0);
        ctx.lineTo(cross.size / 2, 0);
        ctx.moveTo(0, -cross.size / 2);
        ctx.lineTo(0, cross.size / 2);
        ctx.stroke();
        ctx.restore();
    }

    function drawBall() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.shadowColor = "#4ea8de";
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw crosses
        crosses.forEach(drawCross);

        // Ball physics
        if (ball.isFalling) {
            ball.vy += ball.gravity;
            ball.y += ball.vy;

            // Collision with crosses
            for (let cross of crosses) {
                const dx = ball.x - cross.x;
                const dy = ball.y - cross.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < ball.r + cross.size / 2 && ball.vy > 0) {
                    ball.y = cross.y - (ball.r + cross.size / 2) + 2;
                    ball.vy *= ball.bounce;
                    cross.rotating = true;
                }
            }

            // Collision with floor
            if (ball.y + ball.r > height) {
                ball.y = height - ball.r;
                ball.vy *= ball.bounce;
                if (Math.abs(ball.vy) < 2) {
                    setTimeout(resetBall, 900);
                }
            }
        }

        // Animate cross rotation
        crosses.forEach(cross => {
            if (cross.rotating) {
                cross.angle += 0.18;
                if (cross.angle > Math.PI * 2) {
                    cross.angle = 0;
                    cross.rotating = false;
                }
            }
        });

        drawBall();
        requestAnimationFrame(animate);
    }

    // Responsive crosses on resize
    function updateCrosses() {
        crosses.length = 0;
        const spacing = width / (crossCount + 1);
        for (let i = 0; i < crossCount; i++) {
            crosses.push({
                x: (i + 1) * spacing,
                y: height - 60,
                size: 36,
                angle: 0,
                rotating: false
            });
        }
    }
    window.addEventListener('resize', () => {
        resize();
        updateCrosses();
        resetBall();
    });

    animate();
})();

// --- Typewriter width sync for hero text ---
document.addEventListener('DOMContentLoaded', () => {
    const typewriter = document.getElementById('typewriter');
    const heroTextWrap = document.getElementById('heroTextWrap');
    if (typewriter && heroTextWrap) {
        let maxWidth = 0;
        const words = [
            "HELLO, I AM KHALIL SHAKIR",
            "WEB DEVELOPER",
            "3D ENTHUSIAST",
            "UI/UX DESIGNER",
            "REACT SPECIALIST",
            "CREATIVE CODER"
        ];
        // Create a hidden span to measure each word's width
        const measureSpan = document.createElement('span');
        measureSpan.style.visibility = 'hidden';
        measureSpan.style.position = 'absolute';
        measureSpan.style.whiteSpace = 'nowrap';
        measureSpan.style.fontSize = window.getComputedStyle(typewriter).fontSize;
        measureSpan.style.fontFamily = window.getComputedStyle(typewriter).fontFamily;
        document.body.appendChild(measureSpan);

        words.forEach(word => {
            measureSpan.textContent = word;
            maxWidth = Math.max(maxWidth, measureSpan.offsetWidth);
        });
        document.body.removeChild(measureSpan);

        heroTextWrap.style.width = maxWidth + "px";
        window.addEventListener('resize', () => {
            // Recalculate on resize
            let maxWidth = 0;
            document.body.appendChild(measureSpan);
            words.forEach(word => {
                measureSpan.textContent = word;
                maxWidth = Math.max(maxWidth, measureSpan.offsetWidth);
            });
            document.body.removeChild(measureSpan);
            heroTextWrap.style.width = maxWidth + "px";
        });
    }
});


// --- Dots for each section ---
document.addEventListener('DOMContentLoaded', () => {
    const dotNavs = document.querySelectorAll('.section-dots-nav .dot-nav');
    // Swap the order of 'projects' and 'skills' in sectionIds
    const sectionIds = [
        'about',
        'skills',      // skills now comes before projects
        'projects',    // projects now comes after skills
        'experience',
        'education',
        'testimonials',
        'contact'
    ];
    const sections = sectionIds.map(id => document.getElementById(id));

    function updateActiveDot() {
        // If at the hero/landing section (before first main section), deactivate all dots
        const hero = document.querySelector('.hero');
        if (hero) {
            const rect = hero.getBoundingClientRect();
            if (rect.bottom > window.innerHeight * 0.35) {
                dotNavs.forEach(dot => dot.classList.remove('active'));
                return;
            }
        }
        let activeIdx = 0;
        for (let i = 0; i < sections.length; i++) {
            const rect = sections[i]?.getBoundingClientRect();
            if (rect && rect.top <= window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
                activeIdx = i;
                break;
            }
        }
        dotNavs.forEach((dot, i) => {
            dot.classList.toggle('active', i === activeIdx);
        });
    }

    // Scroll to section on dot click
    dotNavs.forEach((dot, i) => {
        dot.addEventListener('click', e => {
            e.preventDefault();
            const section = sections[i];
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });

    window.addEventListener('scroll', updateActiveDot);
    window.addEventListener('resize', updateActiveDot);
    updateActiveDot();
});



