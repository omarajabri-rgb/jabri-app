<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Occasions Engine v20 - Unified Suite</title>
    <style>
        /* --- الأساسيات --- */
        body, html { 
            margin: 0; padding: 0; width: 100%; height: 100%; 
            overflow: hidden; background: #050505; 
            transition: background 2s ease; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* --- تدرجات الثيمات --- */
        body[data-theme="rain"] { background: linear-gradient(180deg, #0b1321, #1c2a43) !important; }
        body[data-theme="ramadan"] { background: linear-gradient(135deg, #0f2027, #2c5364) !important; }
        body[data-theme="sandstorm"] { background: linear-gradient(135deg, #7d6b4c, #d2b48c) !important; }
        body[data-theme="summer"] { background: linear-gradient(135deg, #f7b733, #fc4a1a) !important; }
        body[data-theme="autumn"] { background: linear-gradient(135deg, #4e3535, #a83279) !important; }
        body[data-theme="christmas"] { background: linear-gradient(135deg, #052c14, #1a5e33) !important; }
        body[data-theme="prophet_birthday"] { background: linear-gradient(135deg, #004d40, #00796b) !important; }

        /* --- حاوي التأثيرات --- */
        #season-effects { 
            position: fixed; inset: 0; pointer-events: none; 
            z-index: 0; transition: opacity 1.2s ease; opacity: 1; 
        }
        #season-effects.fading { opacity: 0; }

        /* --- لوحة التحكم --- */
        .panel {
            position: fixed; top: 20px; right: 20px; width: 280px;
            background: rgba(20, 20, 30, 0.85); backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;
            padding: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.5);
            z-index: 1000; color: white;
        }
        .panel h2 { margin: 0 0 15px; font-size: 18px; color: #c9a46b; }
        .panel label { display: block; font-size: 12px; color: #aaa; margin-bottom: 5px; }
        .panel select, .panel button { 
            width: 100%; height: 40px; border-radius: 8px; border: none; 
            margin-bottom: 12px; font-size: 14px; cursor: pointer;
        }
        .panel select { background: #2d3748; color: white; padding: 0 10px; }
        .panel button { background: #c9a46b; color: #000; font-weight: bold; transition: 0.3s; }
        .panel button:hover { background: #e2ba7d; transform: translateY(-2px); }
        .panel button.secondary { background: #4a5568; color: white; }
        .status-box { font-size: 11px; color: #888; border-top: 1px solid #333; pt: 10px; mt: 5px; }
    </style>
</head>
<body>

    <div id="season-effects"></div>

    <div class="panel">
        <h2>🎛️ Control Panel</h2>
        
        <label>اختيار النمط</label>
        <select id="themeSelect">
            <option value="auto">Auto (تلقائي)</option>
            <option value="rain">🌧 Rain</option>
            <option value="ramadan">🌙 Ramadan</option>
            <option value="sandstorm">🌪 Sandstorm</option>
            <option value="christmas">🎄 Christmas</option>
            <option value="prophet_birthday">☪️ Mawlid</option>
            <option value="summer">☀️ Summer</option>
            <option value="autumn">🍂 Autumn</option>
        </select>

        <button onclick="applyTheme()">Apply Theme</button>
        <button class="secondary" onclick="restartEngine()">Restart Engine</button>
        <button class="secondary" onclick="stopEngine()">Stop Engine</button>

        <div class="status-box">
            <div id="statusTxt">Status: Ready</div>
            <div id="themeTxt">Active: --</div>
        </div>
    </div>

    <script>
        /**
         * ⚙️ OCCASIONS ENGINE v20 - THE GOLD MASTER
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
            let container, layers = {}, animationId, particles = [];
            let state = { theme: 'default', isActive: false };
            let lastFlash = 0, lightningOpacity = 0, globalWind = 0, windTarget = 0, lastTimestamp = 0;
            let transitionTimeout = null;
            let lightSource = { x: window.innerWidth / 2, y: -100, radius: 450, intensity: 0 };

            const determineTheme = () => {
                const now = new Date();
                const m = now.getMonth() + 1, d = now.getDate();
                try {
                    const islamic = new Intl.DateTimeFormat('en-u-ca-islamic', {day:'numeric', month:'numeric'}).formatToParts(now);
                    const id = parseInt(islamic.find(p => p.type === 'day').value);
                    const im = parseInt(islamic.find(p => p.type === 'month').value);
                    if (im === 9) return 'ramadan';
                    if (im === 3 && (id === 11 || id === 12)) return 'prophet_birthday';
                } catch(e) {}
                if (m === 3 && d >= 25) return 'sandstorm';
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
                if (!lastTimestamp) lastTimestamp = timestamp;
                const dt = (timestamp - lastTimestamp) / 16.67;
                lastTimestamp = timestamp;

                const { base, glow, lightning } = layers;
                const config = THEME_PARTICLES[state.theme] || THEME_PARTICLES.default;

                base.ctx.clearRect(0, 0, base.el.width, base.el.height);
                glow.ctx.clearRect(0, 0, glow.el.width, glow.el.height);

                if (Math.random() > 0.98) windTarget = (Math.random() - 0.5) * 6;
                globalWind += (windTarget - globalWind) * 0.02 * dt;

                if (state.theme === 'rain' && lightningOpacity > 0) {
                    lightSource.intensity = lightningOpacity * 2.5;
                } else {
                    lightSource.intensity = Math.max(0, lightSource.intensity - 0.01 * dt);
                }

                particles.forEach((p, i) => {
                    p.vy += p.gravity * dt;
                    if (!p.reduced) p.vx += globalWind * p.windFactor * 0.1 * dt;
                    p.vx *= Math.pow(0.98, dt); p.vy *= Math.pow(0.99, dt);
                    p.x += p.vx * dt; p.y += p.vy * dt;

                    if (p.y > window.innerHeight + 50) {
                        p.y = -50; p.x = Math.random() * window.innerWidth; p.vy = config.speed[0];
                    }
                    if (p.x > window.innerWidth + 60) p.x = -60;
                    if (p.x < -60) p.x = window.innerWidth + 60;

                    const dx = p.x - lightSource.x, dy = p.y - lightSource.y;
                    const distSq = dx*dx + dy*dy;
                    let light = (distSq < 202500) ? (1 - Math.sqrt(distSq)/450) * lightSource.intensity : 0;

                    base.ctx.save();
                    base.ctx.globalAlpha = Math.min(1, p.op + light);
                    if (state.theme === 'rain' || state.theme === 'sandstorm') {
                        base.ctx.fillStyle = state.theme === 'rain' ? (light > 0.2 ? "#FFF" : "rgba(255,255,255,0.4)") : "#C2B280";
                        base.ctx.translate(p.x, p.y); base.ctx.rotate(Math.atan2(p.vx, p.vy));
                        base.ctx.fillRect(0, 0, p.size, 15);
                    } else {
                        base.ctx.font = `${Math.floor(p.size)}px Arial`;
                        base.ctx.fillText(p.icon || "✨", p.x, p.y);
                    }
                    base.ctx.restore();

                    if (config.shadow && i % 4 === 0 && !p.reduced) {
                        glow.ctx.globalAlpha = (p.op * 0.3) + light;
                        glow.ctx.shadowBlur = 15; glow.ctx.shadowColor = config.shadow;
                        glow.ctx.fillStyle = config.shadow;
                        glow.ctx.beginPath(); glow.ctx.arc(p.x, p.y, p.size/2, 0, Math.PI*2); glow.ctx.fill();
                    }
                });

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
                        if (state.isActive) cancelAnimationFrame(animationId);
                        state.isActive = true; state.theme = next;
                        document.body.setAttribute('data-theme', state.theme);
                        ['base', 'glow', 'lightning'].forEach(name => {
                            let cvs = container.querySelector(`canvas.${name}-layer`) || document.createElement('canvas');
                            cvs.className = `${name}-layer`; cvs.style.position = "absolute"; cvs.style.inset = "0";
                            if(!cvs.parentNode) container.appendChild(cvs);
                            layers[name] = { el: cvs, ctx: cvs.getContext('2d') };
                        });
                        OccasionsEngine.resize();
                        lastTimestamp = 0; container.classList.remove('fading');
                        animationId = requestAnimationFrame(draw);
                    }, state.isActive ? 1200 : 0);
                },
                resize: () => {
                    if (!state.isActive || !container) return;
                    const ratio = window.devicePixelRatio || 1, w = window.innerWidth, h = window.innerHeight;
                    Object.values(layers).forEach(l => {
                        l.el.width = w * ratio; l.el.height = h * ratio;
                        l.el.style.width = w + 'px'; l.el.style.height = h + 'px';
                        l.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
                    });
                    createParticles();
                },
                destroy: () => {
                    state.isActive = false; cancelAnimationFrame(animationId);
                    if (container) { container.innerHTML = ''; container.classList.remove('fading'); }
                    layers = {}; particles = [];
                }
            };
        })();

        /**
         * 🎮 UI CONTROL PANEL LOGIC
         */
        function updateUI() {
            setTimeout(() => {
                const current = document.body.getAttribute('data-theme') || '--';
                document.getElementById('themeTxt').innerText = 'Active: ' + current.toUpperCase();
                document.getElementById('statusTxt').innerText = 'Status: Running';
            }, 1300);
        }

        function applyTheme() {
            const val = document.getElementById('themeSelect').value;
            document.getElementById('statusTxt').innerText = 'Status: Switching...';
            val === 'auto' ? OccasionsEngine.start() : OccasionsEngine.start(val);
            updateUI();
        }

        function restartEngine() {
            OccasionsEngine.destroy();
            document.getElementById('statusTxt').innerText = 'Status: Restarting...';
            setTimeout(applyTheme, 300);
        }

        function stopEngine() {
            OccasionsEngine.destroy();
            document.getElementById('statusTxt').innerText = 'Status: Stopped';
            document.getElementById('themeTxt').innerText = 'Active: --';
            document.body.removeAttribute('data-theme');
        }

        window.addEventListener('DOMContentLoaded', () => { 
            OccasionsEngine.start(); 
            updateUI(); 
        });
        window.addEventListener('resize', () => OccasionsEngine.resize());
    </script>
</body>
</html>
