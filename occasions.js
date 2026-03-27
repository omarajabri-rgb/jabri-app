// 🎯 Jabri Occasions Engine - Soft Premium Version

const THEME_PARTICLES = {
  jordan_national_day: { speed:[0.25,0.55], size:[16,24], count:12, icons:["🇯🇴","✦"], gravity:0.01, wind:0.01 },
  rain: { speed:[4,6], size:[1,2], count:28, icons:null, gravity:0.16, wind:0.03 },
  ramadan: { speed:[0.18,0.35], size:[14,20], count:10, icons:["✨","☾"], gravity:0.006, wind:0.008 },
  sandstorm: { speed:[1.5,2.6], size:[2,3], count:24, icons:null, gravity:0.02, wind:0.08 },
  christmas: { speed:[0.18,0.45], size:[14,18], count:14, icons:["❄️","✦"], gravity:0.012, wind:0.01 },
  prophet_birthday: { speed:[0.18,0.35], size:[14,18], count:10, icons:["☪️","✨"], gravity:0.008, wind:0.008 },
  spring: { speed:[0.12,0.22], size:[16,20], count:6, icons:["🦋"], gravity:0.002, wind:0.02 },
  summer: { speed:[0.08,0.18], size:[10,12], count:1, icons:["☀️"], gravity:0.001, wind:0.002 },
  autumn: { speed:[0.2,0.35], size:[16,20], count:8, icons:["🍂"], gravity:0.01, wind:0.03 },
  default: { speed:[0.18,0.3], size:[12,16], count:6, icons:["✦"], gravity:0.006, wind:0.006 }
};

const OccasionsEngine = (() => {
  let container, canvas, ctx, particles = [], animationId;
  let state = { theme:'default', active:false };

  const determineTheme = () => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();

    if (m === 5) return 'jordan_national_day';

    try {
      const islamic = new Intl.DateTimeFormat('en-u-ca-islamic', {
        day:'numeric',
        month:'numeric'
      }).formatToParts(now);

      const im = parseInt(islamic.find(p => p.type === 'month')?.value || '0', 10);

      if (im === 9) return 'ramadan';
      if (im === 3) return 'prophet_birthday';
    } catch(e) {}

    if (m === 12 && d >= 24) return 'christmas';
    if ([11,12,1,2].includes(m)) return 'rain';
    if ([3,4,5].includes(m)) return 'spring';
    if ([6,7,8].includes(m)) return 'summer';
    if ([9,10].includes(m)) return 'autumn';

    return 'default';
  };

  const createContainer = () => {
    container = document.getElementById('season-effects');

    if (!container) {
      container = document.createElement('div');
      container.id = 'season-effects';
      container.style.position = 'fixed';
      container.style.inset = '0';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '0';
      container.style.overflow = 'hidden';
      document.body.prepend(container);
    }
  };

  const createCanvas = () => {
    if (!canvas) {
      canvas = document.createElement('canvas');
      container.appendChild(canvas);
      ctx = canvas.getContext('2d');
    }
  };

  const resize = () => {
    if (!canvas || !ctx) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    createParticles();
  };

  const createParticles = () => {
    particles = [];
    const config = THEME_PARTICLES[state.theme] || THEME_PARTICLES.default;

    for (let i = 0; i < config.count; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]),
        size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
        icon: config.icons ? config.icons[Math.floor(Math.random() * config.icons.length)] : null,
        gravity: config.gravity,
        wind: config.wind,
        op: 0.18 + Math.random() * 0.22
      });
    }
  };

  const draw = () => {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.vy += p.gravity;
      p.x += p.vx + p.wind;
      p.y += p.vy;

      if (p.y > window.innerHeight + 30) {
        p.y = -30;
        p.x = Math.random() * window.innerWidth;
      }

      if (p.x > window.innerWidth + 30) p.x = -30;
      if (p.x < -30) p.x = window.innerWidth + 30;

      ctx.globalAlpha = p.op;

      if (p.icon) {
        ctx.font = `${Math.floor(p.size)}px Arial`;
        ctx.fillText(p.icon, p.x, p.y);
      } else {
        ctx.fillStyle = state.theme === 'rain'
          ? 'rgba(255,255,255,0.28)'
          : 'rgba(201,164,107,0.22)';
        ctx.fillRect(p.x, p.y, p.size, 10);
      }
    });

    animationId = requestAnimationFrame(draw);
  };

  return {
    start: (manual) => {
      state.theme = manual || determineTheme();
      document.body.setAttribute('data-theme', state.theme);

      createContainer();
      createCanvas();
      resize();

      if (!state.active) {
        state.active = true;
        draw();
      }
    },

    resize,

    destroy: () => {
      cancelAnimationFrame(animationId);
      particles = [];
      state.active = false;

      if (canvas) {
        canvas.remove();
        canvas = null;
        ctx = null;
      }

      if (container) {
        container.remove();
        container = null;
      }
    }
  };
})();

window.addEventListener('DOMContentLoaded', () => {
  OccasionsEngine.start();
});

window.addEventListener('resize', () => {
  OccasionsEngine.resize();
});
