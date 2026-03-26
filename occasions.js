function getSeason(){
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  if(month === 12 && day >= 25) return 'newyear'
  if(month === 11 || month === 12 || month === 1) return 'rain'
  if(month === 2 || month === 3 || month === 4) return 'snow'
  if(month === 5 || month === 6) return 'spring'
  if(month === 7 || month === 8) return 'summer'
  if(month === 9 || month === 10) return 'autumn'

  return 'summer'
}

function applySeasonEffects(){
  const container = document.getElementById('season-effects')
  if(!container) return

  container.innerHTML = ''
  const theme = document.body.dataset.theme

  // 🌧️ Rain
  if(theme === 'rain'){
    for(let i=0;i<50;i++){
      const drop = document.createElement('div')
      drop.className = 'rain-drop'
      drop.style.left = Math.random()*100 + 'vw'
      drop.style.animationDuration = (Math.random()*1+0.5)+'s'
      container.appendChild(drop)
    }
  }

  // ❄️ Snow
  if(theme === 'snow'){
    for(let i=0;i<35;i++){
      const snow = document.createElement('div')
      snow.className = 'snow-flake'
      snow.innerHTML = '❄'
      snow.style.left = Math.random()*100 + 'vw'
      snow.style.animationDuration = (Math.random()*4+3)+'s'
      container.appendChild(snow)
    }
  }

  // 🍂 Autumn
  if(theme === 'autumn'){
    for(let i=0;i<20;i++){
      const leaf = document.createElement('div')
      leaf.className = 'leaf'
      leaf.innerHTML = '🍂'
      leaf.style.left = Math.random()*100 + 'vw'
      leaf.style.animationDuration = (Math.random()*5+4)+'s'
      container.appendChild(leaf)
    }
  }

  // 🦋 Spring
  if(theme === 'spring'){
    for(let i=0;i<8;i++){
      const b = document.createElement('div')
      b.className = 'butterfly'
      b.innerHTML = '🦋'
      b.style.top = Math.random()*80 + 'vh'
      b.style.animationDuration = (Math.random()*8+6)+'s'
      container.appendChild(b)
    }
  }

  // ☀️ Summer
  if(theme === 'summer'){
    const sun = document.createElement('div')
    sun.className = 'sun-glow'
    container.appendChild(sun)
  }

  // 🎆 New Year
  if(theme === 'newyear'){
    for(let i=0;i<30;i++){
      const star = document.createElement('div')
      star.className = 'snow-flake'
      star.innerHTML = '✦'
      star.style.left = Math.random()*100 + 'vw'
      star.style.animationDuration = (Math.random()*3+2)+'s'
      container.appendChild(star)
    }
  }
}

// 🚀 تشغيل تلقائي
window.addEventListener('DOMContentLoaded', () => {
  document.body.dataset.theme = getSeason()
  applySeasonEffects()
})
