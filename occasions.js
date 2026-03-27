<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jabri Theme Engine | Professional Edition</title>

  <style>
    :root{
      --accent:#c9a46b;
      --accent-dark:#9a6b2f;
      --text:#182033;
      --muted:#7c879c;
      --navy:#1d2940;
      --line:rgba(255,255,255,0.44);
      --glass:rgba(255,255,255,0.64);
      --shadow:0 14px 40px rgba(18,26,43,0.08);
      --shadow-soft:0 8px 22px rgba(18,26,43,0.06);
    }

    *{ box-sizing:border-box; }

    html,body{
      margin:0; width:100%; height:100%; overflow:hidden;
      font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color:var(--text);
    }

    body{
      background: linear-gradient(135deg,#edf2f7,#f7f9fc);
      position:relative;
      transition:background 1.4s ease;
    }

    body::before, body::after{
      content:""; position:fixed; pointer-events:none; z-index:0;
      filter:blur(18px); opacity:.55; transition:all 1.2s ease;
    }

    body::before{ width:260px; height:260px; top:70px; left:-60px; border-radius:50%; background:rgba(201,164,107,0.14); }
    body::after{ width:240px; height:240px; bottom:80px; right:-70px; border-radius:50%; background:rgba(64,110,255,0.08); }

    /* Themes CSS */
    body[data-theme="jordan_national_day"]{ background: linear-gradient(135deg,#f0f4f0,#fbfdfb) !important; }
    body[data-theme="jordan_national_day"]::before{ background:rgba(0,123,61,0.15); }
    body[data-theme="jordan_national_day"]::after{ background:rgba(206,17,38,0.10); }

    body[data-theme="rain"]{ background: linear-gradient(135deg,#edf3fb,#f7f9fc) !important; }
    body[data-theme="rain"]::before{ background:rgba(139,177,255,0.14); }

    body[data-theme="ramadan"]{ background: linear-gradient(135deg,#eef3f6,#f8fafc) !important; }
    body[data-theme="ramadan"]::before{ background:rgba(201,164,107,0.14); }

    #season-effects{ position:fixed; inset:0; pointer-events:none; z-index:0; transition:opacity 0.8s ease; }
    #season-effects.fading{ opacity:0; }

    .panel{
      position:fixed; top:18px; right:18px; width:310px; z-index:1000; padding:20px 18px; border-radius:24px;
      background:var(--glass); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
      border:1px solid var(--line); box-shadow:var(--shadow);
    }

    .brand{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
    .brand-title{ margin:0; font-size:18px; font-weight:900; color:var(--navy); }
    .brand-badge{ min-width:42px; height:42px; border-radius:14px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,var(--accent),#d7b783); color:#fff; font-size:18px; }

    .divider{ width:46px; height:2px; background:var(--accent); margin:10px 0 14px; border-radius:99px; }

    select{ width:100%; height:44px; border-radius:14px; border:1px solid rgba(255,255,255,0.36); margin-bottom:12px; padding:0 12px; background:rgba(255,255,255,0.8); outline:none; }

    .actions{ display:grid; gap:10px; }
    button{ height:46px; border:none; border-radius:16px; font-weight:900; cursor:pointer; transition:all .2s; }
    button.primary{ background:linear-gradient(135deg,var(--accent),#d7b783); color:#fff; }
    button.secondary{ background:var(--navy); color:#fff; }
    button:hover{ transform:translateY(-2px); opacity:0.9; }

    .status-box{ margin-top:14px; padding-top:12px; border-top:1px solid rgba(0,0,0,0.05); }
    .status-item{ display:flex; justify-content:space-between; font-size:12px; padding:8px 0; }
    .status-value{ font-weight:900; color:var(--navy); }

    .center-note{ position:fixed; left:50%; bottom:24px; transform:translateX(-50%); padding:10px 16px; border-radius:99px; background:rgba(255,255,255,0.6); backdrop-filter:blur(8px); font-size:12px; font-weight:800; border:1px solid var(--line); }
  </style>
</head>
<body>

  <div id="season-effects"></div>

  <div class="panel">
    <div class="brand">
      <div>
        <h2 class="brand-title">Jabri Theme Engine</h2>
        <div style="font-size:11px; font-weight:800; color:var(--accent-dark)">v2.1 Professional</div>
      </div>
      <div class="brand-badge">✦</div>
    </div>
    <div class="divider"></div>

    <label style="font-size:12px; font-weight:800; color:var(--muted); display:block; margin-bottom:8px;">اختيار الوضع</label>
    <select id="themeSelect">
      <option value="auto">تلقائي (حسب المناسبة)</option>
      <option value="jordan_national_day">🇯🇴 اليوم الوطني الأردني</option>
      <option value="rain">🌧 مطر</option>
      <option value="ramadan">🌙 رمضان</option>
      <option value="sandstorm">🌪 غبار</option>
      <option value="christmas">🎄 Christmas</option>
      <option value="prophet_birthday">☪️ المولد النبوي</option>
      <option value="summer">☀️ صيف</option>
      <option value="autumn">🍂 خريف</option>
    </select>

    <div class="actions">
      <button class="primary" onclick="applyTheme()">تطبيق الثيم</button>
      <button class="secondary" onclick="restartEngine()">إعادة تشغيل</button>
      <button class="secondary" onclick="stopEngine()">إيقاف</button>
    </div>

    <div class="status-box">
      <div class="status-item"><span>الحالة:</span> <span class="status-value" id="statusTxt">جاهز</span></div>
      <div class="status-item"><span>الثيم الحالي:</span> <span class="status-value" id="themeTxt">--</span></div>
    </div>
  </div>

  <div class="center-note">Jabri premium seasonal background system</div>

  <script>
    const THEME_PARTICLES = {
      jordan_national_day: { speed:[0.3, 0.7], size:[18, 28], count:22, icons:["🇯🇴","👑","⭐"], gravity:0.012, wind:0.02, shadow:"rgba(0,123,61,0.2)" },
      rain: { speed:[4, 7], size:[1, 2], count:80, icons:null, gravity:0.18, wind:0.06, shadow:"rgba(255,255,255,0.4)" },
      ramadan: { speed:[0.2, 0.5], size:[16, 24], count:20, icons:["✨","☾","✦"], gravity:0.008, wind:0.01, shadow:"rgba(201,164,107,0.4)" },
      sandstorm: { speed:[2, 4], size:[2, 4], count:85, icons:null, gravity:0.03, wind:0.2, shadow:"rgba(194,178,128,0.3)" },
      christmas: { speed:[0.3, 0.8], size:[16, 22], count:25, icons:["❄️","✨"], gravity:0.02, wind:0.02, shadow:"rgba(255,255,255,0.4)" },
      prophet_birthday: { speed:[0.2, 0.5], size:[16, 22], count:22, icons:["☪️","✨"], gravity:0.01, wind:0.01, shadow:"rgba(255,255,255,0.3)" },
      summer: { speed:[0.1, 0.3], size:[10, 14], count:15, icons:["☀️","✨"], gravity:0.003, wind:0.01, shadow:"rgba(201,164,107,0.3)" },
      autumn: { speed:[0.3, 0.6], size:[20, 28], count:18, icons:["🍂","🍁"], gravity:0.015, wind:0.04, shadow:"rgba(181,112,58,0.2)" },
      default: { speed:[0.4, 0.8], size:[14, 18], count:16, icons:["✦","✨"], gravity:0.01, wind:0.01, shadow:"rgba(201,164,107,0.2)" }
    };

    const OccasionsEngine = (() => {
      let container, layers = {}, animationId, particles = [];
      let state = { theme:'default', isActive:false };
      let lastTimestamp = 0;
      let transitionTimeout = null;

      const determineTheme = () => {
        const now = new Date();
        const m = now.getMonth() + 1;
        const d = now.getDate();

        // 🇯🇴 منطق يوم الاستقلال الأردني (أيار)
        if(m === 5) return 'jordan_national_day';
        
        // منطق التواريخ الهجرية (المبسط)
        try {
          const islamic = new Intl.DateTimeFormat('en-u-ca-islamic', {day:'numeric', month:'numeric'}).formatToParts(now);
          const im = parseInt(islamic.find(p => p.type === 'month')?.value || '0');
          if(im === 9) return 'ramadan';
          if(im === 3) return 'prophet_birthday';
        } catch(e) {}

        if(m === 12 && d >= 24) return 'christmas';
        if([11,12,1,2].includes(m)) return 'rain';
        if([6,7,8].includes(m)) return 'summer';
        return 'autumn';
      };

      const draw = (timestamp) => {
        if(!state.isActive) return;
        if(!lastTimestamp) lastTimestamp = timestamp;
        const dt = (timestamp - lastTimestamp) / 16.67;
        lastTimestamp = timestamp;

        const { base } = layers;
        base.ctx.clearRect(0, 0, base.el.width, base.el.height);

        particles.forEach(p => {
          p.vy += p.gravity * dt;
          p.x += (p.vx + (0.02 * p.windFactor)) * dt;
          p.y += p.vy * dt;

          if(p.y > window.innerHeight + 50){ p.y = -50; p.x = Math.random() * window.innerWidth; p.vy = 0.5; }
          if(p.x > window.innerWidth + 50) p.x = -50;
          if(p.x < -50) p.x = window.innerWidth + 50;

          base.ctx.save();
          base.ctx.globalAlpha = p.op;
          if(!p.icon){
             base.ctx.fillStyle = state.theme === 'rain' ? "#fff" : "#c2b280";
             base.ctx.fillRect(p.x, p.y, p.size, state.theme === 'rain' ? 12 : 8);
          } else {
             base.ctx.font = `${Math.floor(p.size)}px Arial`;
             base.ctx.fillText(p.icon, p.x, p.y);
          }
          base.ctx.restore();
        });

        animationId = requestAnimationFrame(draw);
      };

      return {
        start: (manual) => {
          const next = manual || determineTheme();
          if(transitionTimeout) clearTimeout(transitionTimeout);
          
          if(!container){
            container = document.getElementById('season-effects');
          }
          
          container.classList.add('fading');

          transitionTimeout = setTimeout(() => {
            if(state.isActive) cancelAnimationFrame(animationId);
            
            state.isActive = true;
            state.theme = next;
            document.body.setAttribute('data-theme', next);

            const cvs = container.querySelector('canvas') || document.createElement('canvas');
            if(!cvs.parentNode) container.appendChild(cvs);
            layers.base = { el:cvs, ctx:cvs.getContext('2d') };

            OccasionsEngine.resize();
            container.classList.remove('fading');
            lastTimestamp = 0;
            animationId = requestAnimationFrame(draw);
          }, 600);
        },

        resize: () => {
          if(!state.isActive || !layers.base) return;
          const ratio = window.devicePixelRatio || 1;
          const { el, ctx } = layers.base;
          el.width = window.innerWidth * ratio;
          el.height = window.innerHeight * ratio;
          el.style.width = window.innerWidth + 'px';
          el.style.height = window.innerHeight + 'px';
          ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

          // إعادة توليد الجزيئات
          particles = [];
          const config = THEME_PARTICLES[state.theme] || THEME_PARTICLES.default;
          for(let i=0; i<config.count; i++){
            particles.push({
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              vx: (Math.random() - 0.5),
              vy: config.speed[0] + Math.random() * config.speed[1],
              gravity: config.gravity,
              windFactor: config.wind,
              size: config.size[0] + Math.random() * (config.size[1]-config.size[0]),
              icon: config.icons ? config.icons[Math.floor(Math.random()*config.icons.length)] : null,
              op: 0.3 + Math.random() * 0.4
            });
          }
        },

        destroy: () => {
          state.isActive = false;
          cancelAnimationFrame(animationId);
          if(container){
            container.innerHTML = '';
            container.classList.remove('fading');
          }
          layers = {};
          particles = [];
          document.body.removeAttribute('data-theme');
          document.getElementById('statusTxt').innerText = 'متوقف';
          document.getElementById('themeTxt').innerText = '--';
        }
      };
    })();

    function applyTheme(){
      const val = document.getElementById('themeSelect').value;
      val === 'auto' ? OccasionsEngine.start() : OccasionsEngine.start(val);
      setTimeout(() => {
        document.getElementById('themeTxt').innerText = document.body.getAttribute('data-theme').toUpperCase();
        document.getElementById('statusTxt').innerText = 'يعمل';
      }, 700);
    }

    function restartEngine(){ OccasionsEngine.destroy(); setTimeout(applyTheme, 300); }
    function stopEngine(){ OccasionsEngine.destroy(); }

    window.addEventListener('DOMContentLoaded', () => { OccasionsEngine.start(); });
    window.addEventListener('resize', () => OccasionsEngine.resize());
  </script>
</body>
</html>
