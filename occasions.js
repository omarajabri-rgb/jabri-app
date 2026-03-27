// 🎯 Jabri Occasions Engine - Animated Real Weather + Smart Layer System

const EFFECT_PARTICLES = {
  none: { speed:[0,0], size:[0,0], count:0, icons:null, gravity:0, wind:0 },

  rain: { speed:[6,10], size:[2,3], count:85, icons:null, gravity:0.22, wind:0.04 },
  snow: { speed:[1,1.8], size:[14,20], count:24, icons:["❄️"], gravity:0.012, wind:0.012 },

  butterflies: { speed:[0.14,0.26], size:[18,24], count:10, icons:["🦋"], gravity:0.002, wind:0.024 },
  leaves: { speed:[0.22,0.36], size:[18,24], count:10, icons:["🍂"], gravity:0.012, wind:0.035 },
  sun: { speed:[0.08,0.18], size:[20,26], count:2, icons:["☀️"], gravity:0.001, wind:0.002 },
  stars: { speed:[0.08,0.14], size:[14,20], count:12, icons:["✦"], gravity:0.001, wind:0.002 },

  ramadan: { speed:[0.18,0.34], size:[16,22], count:14, icons:["✨","☾"], gravity:0.006, wind:0.01 },
  national: { speed:[0.24,0.48], size:[18,26], count:16, icons:["🇯🇴","✦"], gravity:0.01, wind:0.012 },
  christmas: { speed:[0.18,0.38], size:[16,22], count:16, icons:["❄️","✦"], gravity:0.012, wind:0.01 },
  prophet: { speed:[0.18,0.32], size:[16,22], count:14, icons:["☪️","✨"], gravity:0.008, wind:0.01 }
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

  const WEATHER_API_KEY = "ac2020dd50a54f29a48154956262703";
  const WEATHER_CITY = "Amman";
  const WEATHER_CACHE_MINUTES = 15;

  let weatherCache = {
    timestamp: 0,
    effect: null
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

  function determineFallbackEffect() {
    if (state.season === "winter") return state.mode === "night" ? "snow" : "rain";
    if (state.season === "spring") return "butterflies";
    if (state.season === "summer") return state.mode === "night" ? "stars" : "sun";
    if (state.season === "autumn") return "leaves";
    return "none";
  }

  function determineOccasionEffect() {
    if (state.occasion === "ramadan") return "ramadan";
    if (state.occasion === "jordan_national_day") return "national";
    if (state.occasion === "christmas") return "christmas";
    if (state.occasion === "prophet_birthday") return "prophet";
    return null;
  }

  async function getWeatherEffect() {
    const now = Date.now();
    const cacheAge = now - weatherCache.timestamp;
    const cacheValid = cacheAge < WEATHER_CACHE_MINUTES * 60 * 1000;

    if (cacheValid) return weatherCache.effect;

    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(WEATHER_CITY)}&aqi=no`
      );

      if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

      const data = await res.json();

      const condition = String(data?.current?.condition?.text || "").toLowerCase();
      const precip = Number(data?.current?.precip_mm || 0);
      const isDay = Number(data?.current?.is_day || 1);

      let effect = null;

      if (condition.includes("snow")) {
        effect = "snow";
      } else if (
        precip > 0 ||
        condition.includes("rain") ||
        condition.includes("drizzle") ||
        condition.includes("thunder")
      ) {
        effect = "rain";
      } else if (condition.includes("sunny") || condition.includes("clear")) {
        effect = isDay ? "sun" : "stars";
      } else if (
        condition.includes("cloud") ||
        condition.includes("overcast") ||
        condition.includes("mist") ||
        condition.includes("fog") ||
        condition.includes("haze")
      ) {
        effect = isDay ? "none" : "stars";
      }

      weatherCache = {
        timestamp: now,
        effect
      };

      return effect;
    } catch (error) {
      console.log("Weather API Error:", error);
      return null;
    }
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
        vx: (Math.random() - 0.5) * 0.45,
        vy: config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]),
        size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
        icon: config.icons ? config.icons[Math.floor(Math.random() * config.icons.length)] : null,
        gravity: config.gravity,
        wind: config.wind,
        op: 0.24 + Math.random() * 0.28,
        drift: Math.random() * 2 - 1,
        pulse: Math.random() * Math.PI * 2
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

  function drawRain(p) {
    ctx.strokeStyle = `rgba(170,200,255,${p.op})`;
    ctx.lineWidth = p.size;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - 3, p.y + 18);
    ctx.stroke();
  }

  function drawIconParticle(p) {
    ctx.globalAlpha = p.op;

    if (state.effect === "sun") {
      const glow = 24 + Math.sin(p.pulse) * 4;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,220,120,${0.16 + p.op * 0.25})`;
      ctx.arc(p.x, p.y, glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `${Math.floor(p.size)}px Arial`;
      ctx.fillText(p.icon, p.x, p.y);
      return;
    }

    ctx.font = `${Math.floor(p.size)}px Arial`;
    ctx.fillText(p.icon, p.x, p.y);
  }

  function drawParticle(p) {
    if (state.effect === "rain") {
      drawRain(p);
      return;
    }

    drawIconParticle(p);
  }

  function updateRain(p) {
    p.vy += p.gravity;
    p.x += p.wind + p.drift * 0.08;
    p.y += p.vy;

    if (p.y > window.innerHeight + 30) {
      p.y = -30;
      p.x = Math.random() * window.innerWidth;
    }
  }

  function updateSnow(p) {
    p.pulse += 0.02;
    p.y += p.vy * 0.45;
    p.x += Math.sin(p.pulse) * 0.8 + p.wind;

    if (p.y > window.innerHeight + 30) {
      p.y = -30;
      p.x = Math.random() * window.innerWidth;
    }
  }

  function updateButterfly(p) {
    p.pulse += 0.03;
    p.x += 0.7 + Math.sin(p.pulse) * 0.8;
    p.y += Math.cos(p.pulse * 1.3) * 0.4;

    if (p.x > window.innerWidth + 40) {
      p.x = -40;
      p.y = Math.random() * window.innerHeight;
    }
  }

  function updateLeaves(p) {
    p.pulse += 0.025;
    p.y += p.vy * 0.35;
    p.x += Math.sin(p.pulse) * 1.2 + p.wind;

    if (p.y > window.innerHeight + 40) {
      p.y = -40;
      p.x = Math.random() * window.innerWidth;
    }
  }

  function updateSun(p) {
    p.pulse += 0.02;
    p.y += Math.sin(p.pulse) * 0.15;
  }

  function updateStars(p) {
    p.pulse += 0.03;
    p.op = 0.15 + (Math.sin(p.pulse) + 1) * 0.18;
  }

  function updateGenericIcons(p) {
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

  function updateParticle(p) {
    if (state.effect === "rain") return updateRain(p);
    if (state.effect === "snow") return updateSnow(p);
    if (state.effect === "butterflies") return updateButterfly(p);
    if (state.effect === "leaves") return updateLeaves(p);
    if (state.effect === "sun") return updateSun(p);
    if (state.effect === "stars") return updateStars(p);

    updateGenericIcons(p);
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

  async function refresh() {
    const oldSignature = `${state.mode}|${state.season}|${state.occasion}|${state.effect}`;

    state.mode = determineMode();
    state.season = determineSeason();
    state.occasion = determineOccasion();

    const occasionEffect = determineOccasionEffect();
    const weatherEffect = occasionEffect ? null : await getWeatherEffect();

    state.effect = occasionEffect || weatherEffect || determineFallbackEffect();

    const newSignature = `${state.mode}|${state.season}|${state.occasion}|${state.effect}`;

    applyBodyData();

    if (oldSignature !== newSignature) {
      createParticles();
    }
  }

  return {
    async start() {
      createContainer();
      createCanvas();
      await this.refresh();
      resize();

      if (!state.active) {
        state.active = true;
        draw();
      }

      if (!refreshTimer) {
        refreshTimer = setInterval(async () => {
          await this.refresh();
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

window.addEventListener("DOMContentLoaded", async () => {
  await OccasionsEngine.start();
});

window.addEventListener("resize", () => {
  OccasionsEngine.resize();
});
