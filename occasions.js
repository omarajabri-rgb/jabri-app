<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Occasions Engine V20 - The Gold Master</title>
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #050505; transition: background 2s ease; }
        
        /* 🎨 THEME GRADIENTS */
        body[data-theme="rain"] { background: linear-gradient(180deg, #0b1321, #1c2a43) !important; }
        body[data-theme="ramadan"] { background: linear-gradient(135deg, #0f2027, #2c5364) !important; }
        body[data-theme="sandstorm"] { background: linear-gradient(135deg, #7d6b4c, #d2b48c) !important; }
        body[data-theme="summer"] { background: linear-gradient(135deg, #f7b733, #fc4a1a) !important; }
        body[data-theme="autumn"] { background: linear-gradient(135deg, #4e3535, #a83279) !important; }
        body[data-theme="christmas"] { background: linear-gradient(135deg, #052c14, #1a5e33) !important; }
        body[data-theme="prophet_birthday"] { background: linear-gradient(135deg, #004d40, #00796b) !important; }

        #season-effects { position: fixed; inset: 0; pointer-events: none; z-index: 0; transition: opacity 1.2s ease; opacity: 1; }
        #season-effects.fading { opacity: 0; }
        
        .ui-label { position: absolute; bottom: 20px; left: 20px; color: rgba(255,255,255,0.3); font-family: sans-serif; font-size: 12px; z-index: 100; }
    </style>
</head>
<body>

    <div id="season-effects"></div>
    <div class="ui-label">Occasions Engine v20.0.1 - Active</div>

    <script>
        /**
         * ⚙️ DATA DEFINITIONS
         */
        const THEME_PARTICLES = {
            rain: { speed: [5, 8], size: [1, 2], count: 100, icons: null, gravity: 0.2, wind: 0.1, shadow: "#fff" },
            ramadan: { speed: [0.3, 0.7], size: [20, 30], count: 35, icons: ["🏮", "✨"], gravity: 0.01, wind: 0.02, shadow: "gold" },
            sandstorm: { speed: [4, 8], size: [2, 5], count: 120, icons: null, gravity: 0.05, wind: 0.8, shadow: "#C2B280" },
            christmas: { speed: [0.5, 1.2], size: [18, 26], count: 45, icons: ["❄️", "🎄", "✨"], gravity: 0.03, wind: 0.05, shadow: "#fff" },
            prophet_birthday: { speed: [0.3, 0.6], size: [18, 24], count: 40, icons: ["☪️", "✨", "✦"], gravity: 0.01, wind: 0.01, shadow: "#fff" },
            summer: { speed: [0.5, 1], size: [10, 15], count: 20, icons: ["☀️", "✨"], gravity: 0.01, wind: 0.03, shadow: "orange" },
            autumn: { speed: [0.4, 0.8], size: [22, 32], count: 30, icons: ["🍂", "🍁"], gravity: 0.02, wind: 0.1, shadow: null },
            default: { speed: [1, 2], size: [18, 25], count: 30, icons: ["✨"], gravity: 0.02, wind: 0.05, shadow: null }
        };

        const OccasionsEngine = (() => {
            let container, layers = {}, animationId;
            let particles = [];
            let state = { theme: 'default', isActive: false };
            let lastFlash = 0, lightningOpacity = 0, globalWind = 0, windTarget = 0;
            let lastTimestamp = 0;
            let transitionTimeout = null;
            let lightSource = { x: window.innerWidth / 2, y: -100, radius: 450, intensity: 0 };

            // 1. DETERMINISTIC THEME LOGIC
            const determineTheme = () => {
                const now = new Date();
                const m = now.getMonth() + 1, d = now.getDate();
                try {
                    // Hijri Calendar check for Ramadan/Prophet's Birthday
                    const islamic = new Intl.DateTimeFormat('en-u-ca-islamic', {day:'numeric', month:'numeric'}).formatToParts(now);
                    const id = parseInt(islamic.find(p => p.type === 'day').value);
                    const im = parseInt(islamic.find(p => p.type === 'month').value);
                    if (im === 9) return 'ramadan';
                    if (im === 3 && (id === 11 || id === 12)) return 'prophet_birthday';
                } catch(e) {}
                
                if (m === 3 && d >= 25) return 'sandstorm'; // Jordan Khamaseen winds
                if (m === 12 && d >= 24 && d <= 26) return 'christmas';
                if ([11, 12, 1].includes(m)) return 'rain';
                return (m >= 6 && m <= 8) ? 'summer' : 'autumn';
            };

            const initContainer = () => {
                container = document.getElementById('season-effects');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'season-effects';
                    document.body.prepend(container);
                }
            };

            const createParticles = () => {
                particles = [];
                const config = THEME_PARTICLES[state.theme] || THEME_PARTICLES.default;
                const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                
                let count = window.innerWidth < 768 ? Math.floor(config.count * 0.5) : config.count;
                if (prefersReduced) count = Math.floor(count * 0.2);

                for (let i = 0; i < count; i++) {
                    particles.push({
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        vx: (Math.random() - 0.5) * 2,
                        vy: config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]),
                        gravity: config.gravity * (0.8 + Math.random() * 0.4),
                        windFactor: config.wind * (0.5 + Math.random()),
                        size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
                        icon: config.icons ? config.icons[Math.floor(Math.random() * config.icons.length)] : null,
                        op: 0.3 + Math.random() * 0.4,
                        reduced: prefersReduced
                    });
                }
            };

            const draw = (timestamp) => {
                if (!state.isActive) return;

                // Delta Time Calculation (60fps Normalization)
                if (!lastTimestamp) lastTimestamp = timestamp;
                const dt = (timestamp - lastTimestamp) / 16.67;
                lastTimestamp = timestamp;

                const { base, glow, lightning } = layers;
                const config = THEME_PARTICLES[state.theme] || THEME_PARTICLES.default;

                // DPI-Aware ClearRects
                base.ctx.clearRect(0, 0, base.el.width, base.el.height);
                glow.ctx.clearRect(0, 0, glow.el.width, glow.el.height);

                // Wind Force Update
                if (Math.random() > 0.98) windTarget = (Math.random() - 0.5) * 6;
                globalWind += (windTarget - globalWind) * 0.02 * dt;

                // Lighting Intensity Decay
                if (state.theme === 'rain' && lightningOpacity > 0) {
                    lightSource.intensity = lightningOpacity * 2.5;
                    lightSource.y = 50; 
                } else {
                    lightSource.intensity = Math.max(0, lightSource.intensity - 0.01 * dt);
                }

                particles.forEach((p, i) => {
                    // Physics Math with DT Integration
                    p.vy += p.gravity * dt;
                    if (!p.reduced) p.vx += globalWind * p.windFactor * 0.1 * dt;
                    p.vx *= Math.pow(0.98, dt); 
                    p.vy *= Math.pow(0.99, dt);
                    p.x += p.vx * dt; 
                    p.y += p.vy * dt;

                    // Boundary Resets
                    if (p.y > window.innerHeight + 50) {
                        p.y = -50; 
                        p.x = Math.random() * window.innerWidth; 
                        p.vy = config.speed[0];
                    }
                    if (p.x > window.innerWidth + 60) p.x = -60;
                    if (p.x < -60) p.x = window.innerWidth + 60;

                    // Distance-based light intensity
                    const dx = p.x - lightSource.x, dy = p.y - lightSource.y;
                    const distSq = dx*dx + dy*dy;
                    const radSq = lightSource.radius * lightSource.radius;
                    let light = (distSq < radSq) ? (1 - Math.sqrt(distSq)/lightSource.radius) * lightSource.intensity : 0;

                    base.ctx.save();
                    base.ctx.globalAlpha = Math.min(1, p.op + light);
                    
                    if (state.theme === 'rain' || state.theme === 'sandstorm') {
                        base.ctx.fillStyle = state.theme === 'rain' ? (light > 0.2 ? "#FFF" : "rgba(255,255,255,0.4)") : "#C2B280";
                        base.ctx.translate(p.x, p.y);
                        base.ctx.rotate(Math.atan2(p.vx, p.vy));
                        base.ctx.fillRect(0, 0, p.size, 15);
                    } else {
                        base.ctx.font = `${Math.floor(p.size)}px Arial`;
                        base.ctx.fillText(p.icon || "✨", p.x, p.y);
                    }
                    base.ctx.restore();

                    // Selective Glow Rendering
                    if (config.shadow && i % 4 === 0 && !p.reduced) {
                        glow.ctx.globalAlpha = (p.op * 0.3) + light;
                        glow.ctx.shadowBlur = 15; glow.ctx.shadowColor = config.shadow;
                        glow.ctx.fillStyle = config.shadow;
                        glow.ctx.beginPath(); glow.ctx.arc(p.x, p.y, p.size/2, 0, Math.PI*2); glow.ctx.fill();
                    }
                });

                // Thunder Flash & Fade Logic
                if (lightningOpacity > 0) {
                    lightning.ctx.clearRect(0, 0, lightning.el.width, lightning.el.height);
                    lightningOpacity *= Math.pow(0.92, dt);
                    if (lightningOpacity < 0.01) lightningOpacity = 0;
                    lightning.ctx.globalAlpha = lightningOpacity;
                    lightning.ctx.fillStyle = "white";
                    lightning.ctx.fillRect(0, 0, lightning.el.width, lightning.el.height);
                }

                if (state.theme === 'rain' && timestamp - lastFlash > 5000 && Math.random() > 0.99) {
                    lightningOpacity = 0.35; lastFlash = timestamp;
                }

                animationId = requestAnimationFrame(draw);
            };

            return {
                start: (manual) => {
                    const next = manual || determineTheme();
                    if (state.theme === next && state.isActive) return;
                    if (transitionTimeout) clearTimeout(transitionTimeout);

                    initContainer();
                    container.classList.add('fading');

                    transitionTimeout = setTimeout(() => {
                        if (state.isActive && animationId) cancelAnimationFrame(animationId);
                        
                        state.isActive = true;
                        state.theme = next;
                        document.body.setAttribute('data-theme', state.theme);

                        ['base', 'glow', 'lightning'].forEach(name => {
                            let canvas = container.querySelector(`canvas.${name}-layer`) || document.createElement('canvas');
                            canvas.className = `${name}-layer`;
                            canvas.style.position = "absolute"; canvas.style.inset = "0";
                            if(!canvas.parentNode) container.appendChild(canvas);
                            layers[name] = { el: canvas, ctx: canvas.getContext('2d') };
                        });

                        OccasionsEngine.resize();
                        lastTimestamp = 0; 
                        container.classList.remove('fading');
                        animationId = requestAnimationFrame(draw);
                    }, state.isActive ? 1200 : 0);
                },
                resize: () => {
                    if (!state.isActive || !container) return;
                    const ratio = window.devicePixelRatio || 1;
                    const w = window.innerWidth, h = window.innerHeight;
                    Object.values(layers).forEach(layer => {
                        layer.el.width = w * ratio; 
                        layer.el.height = h * ratio;
                        layer.el.style.width = `${w}px`; 
                        layer.el.style.height = `${h}px`;
                        layer.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
                    });
                    createParticles();
                },
                destroy: () => {
                    state.isActive = false;
                    if (animationId) cancelAnimationFrame(animationId);
                    if (transitionTimeout) clearTimeout(transitionTimeout);
                    if (container) {
                        container.innerHTML = '';
                        if (container.parentNode) container.parentNode.removeChild(container);
                        container = null;
                    }
                    layers = {}; particles = [];
                }
            };
        })();

        // Bootstrap the Engine
        window.addEventListener('DOMContentLoaded', () => OccasionsEngine.start());
        window.addEventListener('resize', () => OccasionsEngine.resize());
    </script>
</body>
</html>
