// 🎯 Jabri Occasions Engine - Final Smart Layer System

const EFFECT_PARTICLES = {
  none: { speed:[0,0], size:[0,0], count:0, icons:null, gravity:0, wind:0 },

  rain: { speed:[4,6], size:[1,2], count:42, icons:null, gravity:0.16, wind:0.03 },
  snow: { speed:[0.8,1.4], size:[12,16], count:16, icons:["❄️"], gravity:0.01, wind:0.01 },

  butterflies: { speed:[0.12,0.22], size:[16,20], count:6, icons:["🦋"], gravity:0.002, wind:0.02 },
  leaves: { speed:[0.18,0.3], size:[16,20], count:6, icons:["🍂"], gravity:0.01, wind:0.03 },
  sun: { speed:[0.08,0.18], size:[10,12], count:1, icons:["☀️"], gravity:0.001, wind:0.002 },
  stars: { speed:[0.08,0.14], size:[12,16], count:6, icons:["✦"], gravity:0.001, wind:0.002 },

  ramadan: { speed:[0.16,0.3], size:[14,18], count:8, icons:["✨","☾"], gravity:0.006, wind:0.008 },
  national: { speed:[0.22,0.45], size:[16,22], count:10, icons:["🇯🇴","✦"], gravity:0.01, wind:0.01 },
  christmas: { speed:[0.18,0.35], size:[14,18], count:10, icons:["❄️","✦"], gravity:0.012, wind:0.01 },
  prophet: { speed:[0.16,0.3], size:[14,18], count:8, icons:["☪️","✨"], gravity:0.008, wind:0.008 }
};

const OccasionsEngine = (() => {
  let container = null;
  let canvas = null;
  let ctx = null;
  let particles = [];
  let animationId = null;
  let refreshTimer = null;

  const state = {
    active: false,
    mode: "day",
    season: "default",
    occasion: "none",
    effect: "none"
  };

  function getNowParts() {
    const now = new Date();
    return {
      now,
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours()
    };
  }

  function determineMode() {
    const { hour } = getNowParts();
    return (hour >= 18 || hour < 6) ? "night" : "day";
  }

  function determineSeason() {
    const { month } = getNowParts();

    if ([12, 1, 2, 3].includes(month)) return "winter";
    if ([4, 5, 6].includes(month)) return "spring";
    if ([7, 8].includes(month)) return "summer";
    if ([9, 10, 11].includes(month)) return "autumn";

    return "default";
  }

  function determineOccasion() {
    const { now, month, day } = getNowParts();

    if (month === 5) return "jordan_national_day";
    if (month === 12 && day >= 24) return "christmas";

    try {
      const islamic = new Intl.DateTimeFormat("en-u-ca-islamic", {
        day: "numeric",
        month: "numeric"
      }).formatToParts(now);

      const islamicMonth = parseInt(
        islamic.find(p => p.type === "month")?.value || "0",
        10
      );

      if (islamicMonth === 9) return "ramadan";
      if (islamicMonth === 3) return "prophet_birthday";
    } catch (e) {}

    return "none";
  }

  function determineEffect() {
    if (state.occasion === "ramadan") return "ramadan";
    if (state.occasion === "jordan_national_day") return "national";
    if (state.occasion === "christmas") return "christmas";
    if (state.occasion === "prophet_birthday") return "prophet";

    if (state.season === "winter") return state.mode === "night" ? "snow" : "rain";
    if (state.season === "spring") return "butterflies";
    if (state.season === "summer") return state.mode === "night" ? "stars" : "sun";
    if (state.season === "autumn") return "leaves";

    return "none";
  }

  function applyBodyData() {
    document.body.setAttribute("data-mode", state.mode);
    document.body.setAttribute("data-season", state.season);
    document.body.setAttribute("data-occasion", state.occasion);
    document.body.setAttribute("data-effect", state.effect);
  }

  function createContainer() {
    container = document.getElementById("season-effects");

    if (!container) {
      container = document.createElement("div");
      container.id = "season-effects";
      document.body.prepend(container);
    }

    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "0";
    container.style.overflow = "hidden";
  }

  function createCanvas() {
    if (!canvas) {
      canvas = document.createElement("canvas");
      container.appendChild(canvas);
      ctx = canvas.getContext("2d");
    }
  }

  function createParticles() {
    particles = [];
    const config = EFFECT_PARTICLES[state.effect] || EFFECT_PARTICLES.none;

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
        op: 0.12 + Math.random() * 0.15
      });
    }
  }

  function resize() {
    if (!canvas || !ctx) return;

    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    createParticles();
  }

  function drawParticle(p) {
    ctx.globalAlpha = p.op;

    if (p.icon) {
      ctx.font = `${Math.floor(p.size)}px Arial`;
      ctx.fillText(p.icon, p.x, p.y);
      return;
    }

    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(p.x, p.y, p.size, 10);
  }

  function updateParticle(p) {
    p.vy += p.gravity;
    p.x += p.vx + p.wind;
    p.y += p.vy;

    if (p.y > window.innerHeight + 30) {
      p.y = -30;
      p.x = Math.random() * window.innerWidth;
    }

    if (p.x > window.innerWidth + 30) p.x = -30;
    if (p.x < -30) p.x = window.innerWidth + 30;
  }

  function draw() {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      updateParticle(p);
      drawParticle(p);
    });

    animationId = requestAnimationFrame(draw);
  }

  function refresh() {
    const oldSignature = `${state.mode}|${state.season}|${state.occasion}|${state.effect}`;

    state.mode = determineMode();
    state.season = determineSeason();
    state.occasion = determineOccasion();
    state.effect = determineEffect();

    const newSignature = `${state.mode}|${state.season}|${state.occasion}|${state.effect}`;

    applyBodyData();

    if (oldSignature !== newSignature) {
      createParticles();
    }
  }

  return {
    start() {
      createContainer();
      createCanvas();
      refresh();
      resize();

      if (!state.active) {
        state.active = true;
        draw();
      }

      if (!refreshTimer) {
        refreshTimer = setInterval(() => {
          this.refresh();
        }, 60000);
      }
    },

    refresh,

    resize,

    destroy() {
      cancelAnimationFrame(animationId);
      clearInterval(refreshTimer);

      refreshTimer = null;
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

window.addEventListener("DOMContentLoaded", () => {
  OccasionsEngine.start();
});

window.addEventListener("resize", () => {
  OccasionsEngine.resize();
});
