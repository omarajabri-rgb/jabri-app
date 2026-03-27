// 🎯 Jabri Occasions Engine (Clean Version)

const THEME_PARTICLES = {
  jordan_national_day: { speed:[0.3,0.7], size:[18,28], count:22, icons:["🇯🇴","👑","⭐"], gravity:0.012, wind:0.02 },
  rain: { speed:[4,7], size:[1,2], count:80, icons:null, gravity:0.18, wind:0.06 },
  ramadan: { speed:[0.2,0.5], size:[16,24], count:20, icons:["✨","☾","✦"], gravity:0.008, wind:0.01 },
  sandstorm: { speed:[2,4], size:[2,4], count:85, icons:null, gravity:0.03, wind:0.2 },
  christmas: { speed:[0.3,0.8], size:[16,22], count:25, icons:["❄️","✨"], gravity:0.02, wind:0.02 },
  prophet_birthday: { speed:[0.2,0.5], size:[16,22], count:22, icons:["☪️","✨"], gravity:0.01, wind:0.01 },
  summer: { speed:[0.1,0.3], size:[10,14], count:15, icons:["☀️","✨"], gravity:0.003, wind:0.01 },
  autumn: { speed:[0.3,0.6], size:[20,28], count:18, icons:["🍂","🍁"], gravity:0.015, wind:0.04 },
  default: { speed:[0.4,0.8], size:[14,18], count:16, icons:["✨"], gravity:0.01, wind:0.01 }
};

const OccasionsEngine = (() => {
  let container, canvas, ctx, particles = [], animationId;
  let state = { theme:'default', active:false };

  const determineTheme = () => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();

    if(m === 5) return 'jordan_national_day';

    try{
      const islamic = new Intl.DateTimeFormat('en-u-ca-islamic',{day:'numeric',month:'numeric'}).formatToParts(now);
      const im = parseInt(islamic.find(p=>p.type==='month')?.value||'0');
      if(im===9) return 'ramadan';
      if(im===3) return 'prophet_birthday';
    }catch(e){}

    if(m===12 && d>=24) return 'christmas';
    if([11,12,1,2].includes(m)) return 'rain';
    if([6,7,8].includes(m)) return 'summer';

    return 'autumn';
  };

  const createContainer = () => {
    container = document.getElementById('season-effects');
    if(!container){
      container = document.createElement('div');
      container.id = 'season-effects';
      container.style.position = 'fixed';
      container.style.inset = '0';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '0';
      document.body.prepend(container);
    }
  };

  const createCanvas = () => {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');
  };

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(ratio,0,0,ratio,0,0);
    createParticles();
  };

  const createParticles = () => {
    particles = [];
    const config = THEME_PARTICLES[state.theme] || THEME_PARTICLES.default;

    for(let i=0;i<config.count;i++){
      particles.push({
        x: Math.random()*window.innerWidth,
        y: Math.random()*window.innerHeight,
        vx: (Math.random()-0.5),
        vy: config.speed[0] + Math.random()*(config.speed[1]-config.speed[0]),
        size: config.size[0] + Math.random()*(config.size[1]-config.size[0]),
        icon: config.icons ? config.icons[Math.floor(Math.random()*config.icons.length)] : null,
        gravity: config.gravity,
        wind: config.wind,
        op: 0.3 + Math.random()*0.4
      });
    }
  };

  const draw = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    particles.forEach(p=>{
      p.vy += p.gravity;
      p.x += p.vx + p.wind;
      p.y += p.vy;

      if(p.y > window.innerHeight){
        p.y = -20;
        p.x = Math.random()*window.innerWidth;
      }

      ctx.globalAlpha = p.op;

      if(p.icon){
        ctx.font = `${Math.floor(p.size)}px Arial`;
        ctx.fillText(p.icon,p.x,p.y);
      }else{
        ctx.fillStyle = state.theme==='rain' ? "#fff" : "#c2b280";
        ctx.fillRect(p.x,p.y,p.size,10);
      }
    });

    animationId = requestAnimationFrame(draw);
  };

  return {
    start:(manual)=>{
      state.theme = manual || determineTheme();
      document.body.setAttribute('data-theme',state.theme);

      createContainer();
      createCanvas();
      resize();

      state.active = true;
      draw();
    },

    resize:resize,

    destroy:()=>{
      cancelAnimationFrame(animationId);
      if(container) container.remove();
      state.active = false;
    }
  };
})();

window.addEventListener('DOMContentLoaded', ()=>{
  OccasionsEngine.start();
});

window.addEventListener('resize', ()=>{
  OccasionsEngine.resize();
});
