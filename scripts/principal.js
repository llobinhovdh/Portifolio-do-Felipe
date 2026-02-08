'use strict';

// ═══════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════
const VERSION = '1.1.0';
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
const MATRIX_FONT_SIZE = 14;
const MATRIX_DEFAULT_COLOR = '#22c55e';
const MATRIX_FADE_ALPHA = 'rgba(9, 9, 11, 0.05)';

// ═══════════════════════════════════════════════════════════════
// Boot Sequence
// ═══════════════════════════════════════════════════════════════
const bootMessages = [
    { text: 'Loading system modules...', type: 'info' },
    { text: 'Initializing network interface', type: 'ok' },
    { text: 'Connecting to server...', type: 'info' },
    { text: 'Connection established', type: 'ok' },
    { text: 'Loading user profile', type: 'ok' },
    { text: 'Preparing workspace', type: 'ok' },
    { text: 'System ready', type: 'ok' },
];

const bootLinesEl = document.getElementById('boot-lines');
const progressBar = document.getElementById('progress-bar');
const bootStatus = document.getElementById('boot-status');
const bootScreen = document.getElementById('boot-screen');
const app = document.getElementById('app');

async function runBoot() {
    const statusMessages = ['Initializing...', 'Loading...', 'Connecting...', 'Almost there...', 'Ready!'];

    for (let i = 0; i < bootMessages.length; i++) {
        const msg = bootMessages[i];
        const line = document.createElement('div');
        line.className = 'boot-line';
        line.innerHTML = `<span class="${msg.type}">[${msg.type.toUpperCase()}]</span> ${msg.text}`;
        bootLinesEl.appendChild(line);

        await sleep(80);
        line.classList.add('visible');

        const progress = ((i + 1) / bootMessages.length) * 100;
        progressBar.style.width = progress + '%';
        bootStatus.textContent = statusMessages[Math.min(i, statusMessages.length - 1)];

        await sleep(200 + Math.random() * 150);
    }

    await sleep(500);
    bootScreen.classList.add('hidden');
    app.classList.add('visible');

    // Start terminal animation
    startTerminalAnimation();

    // Start scroll animations
    observeSections();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Terminal Animation & Interaction
async function startTerminalAnimation() {
    const terminal = document.getElementById('terminal-body');
    const profileData = {
        name: "Lobinho",
        role: "Full Stack Developer",
        location: "Brazil",
        experience: "1 year",
        status: "Available for work",
        stack: ["JavaScript", "Python", "React", "Node.js", "PostgreSQL"]
    };

    await sleep(800);

    const output = document.createElement('div');
    output.className = 'terminal-output';
    output.style.whiteSpace = 'pre';
    terminal.appendChild(output);

    const json = JSON.stringify(profileData, null, 2);
    for (let i = 0; i < json.length; i++) {
        output.textContent += json[i];
        if (json[i] === '\n' || json[i] === ',') {
            await sleep(30);
        } else {
            await sleep(15);
        }
    }

    // Interactive Input
    createInputLine(terminal);
}

function createInputLine(terminal) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML = `
        <span class="terminal-prompt">$</span>
        <input type="text" class="terminal-input" autofocus spellcheck="false" autocomplete="off">
    `;
    terminal.appendChild(line);

    const input = line.querySelector('.terminal-input');
    input.focus();

    // Re-focus on click
    terminal.addEventListener('click', () => input.focus());

    input.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim().toLowerCase();
            input.disabled = true;

            // Create simple text node to replace input (persistence)
            const cmdDisplay = document.createElement('span');
            cmdDisplay.className = 'terminal-cmd';
            cmdDisplay.textContent = cmd;
            line.replaceChild(cmdDisplay, input);

            await processCommand(cmd, terminal);
            createInputLine(terminal);

            // Auto scroll to bottom
            const terminalCard = terminal.closest('.terminal-card'); // Adjust if needed
            if (terminalCard) terminalCard.scrollTop = terminalCard.scrollHeight;
        }
    });
}

async function processCommand(cmd, terminal) {
    const response = document.createElement('div');
    response.className = 'terminal-output';
    response.style.marginTop = '8px';
    response.style.marginBottom = '8px';
    response.style.color = 'var(--text-dim)';

    const args = cmd.split(' ');
    const mainCmd = args[0];

    switch (mainCmd) {
        case 'help':
            response.innerHTML = 'Available commands: <span style="color:var(--green)">about</span>, <span style="color:var(--green)">projects</span>, <span style="color:var(--green)">contact</span>, <span style="color:var(--green)">clear</span><br><span style="color:var(--text-dim)">Try also: sudo, matrix, coffee, ls, whoami</span>';
            break;
        case 'about':
            response.textContent = 'User: Lobinho | Role: Full Stack Developer | Mission: Code the Future.';
            break;
        case 'projects':
            response.textContent = 'Projetos: Galaxia do Amor, Assistente Educacional.';
            document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'contact':
            response.textContent = 'Opening communication channels... check the contact section below.';
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'clear':
        case 'cls':
            terminal.innerHTML = '';
            return; // No response needed
        case 'sudo':
            response.textContent = 'PERMISSION DENIED: Nice try! You need to be Lobinho to do that.';
            response.style.color = '#ef4444';
            break;
        case 'matrix':
            if (args[1] === 'red') {
                MatrixRain.setColor('#ef4444');
                response.textContent = 'WARNING: Red Pill accepted. System integrity critical.';
                response.style.color = '#ef4444';
            } else if (args[1] === 'blue') {
                MatrixRain.setColor('#3b82f6');
                response.textContent = 'Blue Pill accepted. Returning to blissful ignorance...';
                response.style.color = '#3b82f6';
            } else if (args[1] === 'gold') {
                MatrixRain.setColor('#fbbf24');
                response.textContent = 'LEGENDARY MODE ACTIVATED.';
                response.style.color = '#fbbf24';
            } else if (args[1] === 'reset') {
                MatrixRain.setColor(MATRIX_DEFAULT_COLOR);
                response.textContent = 'Matrix system restored to default.';
                response.style.color = MATRIX_DEFAULT_COLOR;
            } else {
                response.textContent = 'Usage: matrix [red | blue | gold | reset]';
            }
            break;
        case 'coffee':
            response.innerHTML = `<pre style="color: #facc15; margin: 10px 0; font-family: monospace; line-height: 1.2;">
    (  )   (   )  )
     ) (   )  (  (
     ( )  (    ) )
     _____________
    <_____________> ___
    |             |/ _ \
    |  LOBINHO    | | | |
    |   COFFEE    | |_| |
    |_____________|\___/
    </pre>☕ Brewing virtual coffee... Done!`;
            break;
        case 'whoami':
            response.textContent = 'guest@lobinho.dev (IP: Unknown | Status: Curious)';
            break;
        case 'ls':
            response.textContent = 'inicio.html  estilos/  scripts/  projetos/';
            break;
        case 'cat':
            if (args[1] && args[1].includes('secret')) {
                response.textContent = 'ACCESS GRANTED: "The best way to predict the future is to create it."';
                response.style.color = '#22c55e';
            } else {
                response.textContent = args[1] ? `Reading ${args[1]}... Access Denied.` : 'Usage: cat [filename]';
            }
            break;
        case '':
            return;
        default:
            response.textContent = 
`Command not found: ${cmd}. Type 'help' for options.
`;
            response.style.color = '#ef4444';
    }

    terminal.appendChild(response);
    await sleep(10);
}

// Scroll Animations
function observeSections() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// Navigation active state (Correção Final)
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -30% 0px',
    threshold: 0
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Se não estiver no finalzinho da página, processa normal
            if ((window.innerHeight + window.scrollY) < document.body.offsetHeight - 100) {
                const currentSectionId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + currentSectionId) {
                        link.classList.add('active');
                    }
                });
            }
        }
    });
}, observerOptions);

sections.forEach(section => {
    sectionObserver.observe(section);
});

// Click handlers: set active immediately and perform smooth scroll
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();
        const target = document.querySelector(href);
        // Set active class immediately for better UX
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        // Smooth scroll to target section
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Update URL hash without abrupt jump
        try {
            history.replaceState(null, '', href);
        } catch (err) {
            console.warn('Failed to update URL hash:', err.message);
        }

        // Close mobile menu if open
        closeMobileMenu();
    });
});

// ═══════════════════════════════════════════════════════════════
// Mobile Menu Toggle
// ═══════════════════════════════════════════════════════════════
const mobileToggle = document.querySelector('.nav-mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = mobileMenu.querySelectorAll('.nav-link');

function closeMobileMenu() {
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('active');
}

function toggleMobileMenu() {
    const isOpen = mobileToggle.classList.toggle('active');
    mobileToggle.setAttribute('aria-expanded', isOpen);
    mobileMenu.classList.toggle('active');
}

mobileToggle.addEventListener('click', toggleMobileMenu);

// Close menu when clicking a link
mobileLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();
        const target = document.querySelector(href);

        // Update active states
        mobileLinks.forEach(l => l.classList.remove('active'));
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        // Also update desktop nav
        document.querySelector(`.nav-links .nav-link[href="${href}"]`)?.classList.add('active');

        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        closeMobileMenu();

        try {
            history.replaceState(null, '', href);
        } catch (err) {
            console.warn('Failed to update URL hash:', err.message);
        }
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        closeMobileMenu();
    }
});

// Força "Contato" ativo quando chega no final da página
window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#contact') {
                link.classList.add('active');
            }
        });
    }
});

// ═══════════════════════════════════════════════════════════════
// Matrix Rain (using requestAnimationFrame for better performance)
// ═══════════════════════════════════════════════════════════════
const MatrixRain = {
    canvas: document.getElementById('matrix'),
    ctx: null,
    columns: 0,
    drops: [],
    color: MATRIX_DEFAULT_COLOR,
    animationId: null,
    lastFrameTime: 0,
    frameInterval: 50, // ms between frames

    init() {
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.columns = Math.floor(this.canvas.width / MATRIX_FONT_SIZE);
        this.drops = Array(this.columns).fill(1);
    },

    draw(timestamp) {
        // Throttle to ~20fps for performance
        if (timestamp - this.lastFrameTime < this.frameInterval) {
            this.animationId = requestAnimationFrame((t) => this.draw(t));
            return;
        }
        this.lastFrameTime = timestamp;

        this.ctx.fillStyle = MATRIX_FADE_ALPHA;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.color;
        this.ctx.font = MATRIX_FONT_SIZE + 'px monospace';

        for (let i = 0; i < this.drops.length; i++) {
            const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
            this.ctx.fillText(char, i * MATRIX_FONT_SIZE, this.drops[i] * MATRIX_FONT_SIZE);
            if (this.drops[i] * MATRIX_FONT_SIZE > this.canvas.height && Math.random() > 0.98) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }

        this.animationId = requestAnimationFrame((t) => this.draw(t));
    },

    start() {
        this.animationId = requestAnimationFrame((t) => this.draw(t));
    },

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    },

    setColor(newColor) {
        this.color = newColor;
    }
};

MatrixRain.init();
MatrixRain.start();

// Start boot sequence
runBoot();

// ═══════════════════════════════════════════════════════════════
// Dynamic Copyright Year
// ═══════════════════════════════════════════════════════════════
const yearElement = document.getElementById('copyright-year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}
