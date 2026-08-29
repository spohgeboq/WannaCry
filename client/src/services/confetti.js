// Canvas Confetti Engine for Level-Up & Achievements celebration
// Zero dependencies, ultra-fast canvas particle burst

export function fireConfetti(options = {}) {
  if (typeof window === 'undefined') return;

  const count = options.count || 70;
  const colors = options.colors || ['#f97316', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#eab308'];
  
  let canvas = document.getElementById('barinbil-confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'barinbil-confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const width = (canvas.width = window.innerWidth * dpr);
  const height = (canvas.height = window.innerHeight * dpr);

  const particles = [];
  const originX = (options.x !== undefined ? options.x : window.innerWidth / 2) * dpr;
  const originY = (options.y !== undefined ? options.y : window.innerHeight * 0.45) * dpr;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = (Math.random() * 8 + 4) * dpr;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - (Math.random() * 4 + 2) * dpr,
      size: (Math.random() * 8 + 6) * dpr,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 15,
      alpha: 1,
      gravity: 0.25 * dpr,
      drag: 0.96,
      shape: Math.random() > 0.4 ? 'rect' : 'circle'
    });
  }

  let animationFrameId = null;

  function render() {
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    for (let p of particles) {
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vRotation;
      p.alpha -= 0.012;

      if (p.alpha > 0) {
        activeParticles++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, width, height);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    }
  }

  render();
}
