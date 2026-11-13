/** Canvas particles: confetti, and the hearts and stars a child throws by tapping. */

type Shape = 'heart' | 'star' | 'rect' | 'dot' | 'twinkle';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  shape: Shape;
  life: number;
  max: number;
  wobble: number;
}

const COLORS = ['#ff5f86', '#ff8ec7', '#ffd84a', '#8be9ff', '#b98bff', '#6fdc9a', '#ff9f43', '#ffffff'];
const MAX_PARTICLES = 420;

class Fx {
  private canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private parts: Particle[] = [];
  private raf = 0;
  private last = 0;
  private dpr = 1;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'fx-canvas';
    this.g = this.canvas.getContext('2d')!;
    window.addEventListener('resize', () => this.resize());
  }

  mount(parent: HTMLElement): void {
    parent.appendChild(this.canvas);
    this.resize();
  }

  private resize(): void {
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(window.innerWidth * this.dpr);
    this.canvas.height = Math.round(window.innerHeight * this.dpr);
  }

  private add(p: Particle): void {
    if (this.parts.length >= MAX_PARTICLES) this.parts.shift();
    this.parts.push(p);
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame((t) => this.tick(t));
    }
  }

  /** Hearts and stars flying up from a tap. */
  burst(x: number, y: number, count = 9, kinds: Shape[] = ['heart', 'star']): void {
    for (let i = 0; i < count; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const sp = 220 + Math.random() * 380;
      this.add({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        g: 520,
        rot: (Math.random() - 0.5) * 0.8,
        vr: (Math.random() - 0.5) * 5,
        size: 16 + Math.random() * 22,
        color: COLORS[Math.floor(Math.random() * 5)],
        shape: kinds[i % kinds.length],
        life: 0,
        max: 1.1 + Math.random() * 0.6,
        wobble: 0,
      });
    }
  }

  /** Little twinkles around a point, for when an item goes on. */
  twinkle(x: number, y: number, count = 10, spread = 90): void {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 160;
      this.add({
        x: x + Math.cos(a) * spread * Math.random(),
        y: y + Math.sin(a) * spread * Math.random(),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        g: 60,
        rot: 0,
        vr: 2,
        size: 10 + Math.random() * 16,
        color: ['#ffffff', '#ffe98a', '#ffc4e3'][i % 3],
        shape: 'twinkle',
        life: 0,
        max: 0.6 + Math.random() * 0.5,
        wobble: 0,
      });
    }
  }

  /** Confetti falling across the whole screen. */
  confetti(count = 110): void {
    const w = window.innerWidth;
    for (let i = 0; i < count; i++) {
      this.add({
        x: Math.random() * w,
        y: -20 - Math.random() * window.innerHeight * 0.5,
        vx: (Math.random() - 0.5) * 120,
        vy: 160 + Math.random() * 240,
        g: 60,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 9,
        size: 10 + Math.random() * 12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: i % 5 === 0 ? 'star' : i % 7 === 0 ? 'heart' : i % 3 === 0 ? 'dot' : 'rect',
        life: 0,
        max: 4.5,
        wobble: Math.random() * 6,
      });
    }
  }

  clear(): void {
    this.parts = [];
  }

  private tick(now: number): void {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const g = this.g;
    const h = window.innerHeight;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.clearRect(0, 0, window.innerWidth, h);
    const alive: Particle[] = [];
    for (const p of this.parts) {
      p.life += dt;
      if (p.life >= p.max || p.y > h + 60) continue;
      p.vy += p.g * dt;
      p.x += (p.vx + Math.sin(p.life * 3 + p.wobble) * (p.wobble ? 50 : 0)) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const fade = Math.min(1, (p.max - p.life) / 0.35);
      g.save();
      g.globalAlpha = fade;
      g.translate(p.x, p.y);
      g.rotate(p.rot);
      g.fillStyle = p.color;
      this.draw(p);
      g.restore();
      alive.push(p);
    }
    this.parts = alive;
    if (alive.length) this.raf = requestAnimationFrame((t) => this.tick(t));
    else {
      this.raf = 0;
      g.clearRect(0, 0, window.innerWidth, h);
    }
  }

  private draw(p: Particle): void {
    const g = this.g;
    const s = p.size;
    switch (p.shape) {
      case 'rect':
        g.scale(1, Math.cos(p.life * 7 + p.wobble));
        g.fillRect(-s / 2, -s / 3, s, s * 0.66);
        break;
      case 'dot':
        g.beginPath();
        g.arc(0, 0, s / 2.4, 0, Math.PI * 2);
        g.fill();
        break;
      case 'heart': {
        const w = s / 2;
        g.beginPath();
        g.moveTo(0, w * 0.9);
        g.bezierCurveTo(-w * 1.5, -w * 0.1, -w * 0.9, -w * 1.15, 0, -w * 0.4);
        g.bezierCurveTo(w * 0.9, -w * 1.15, w * 1.5, -w * 0.1, 0, w * 0.9);
        g.fill();
        break;
      }
      case 'star':
      case 'twinkle': {
        const pts = p.shape === 'star' ? 5 : 4;
        const inner = p.shape === 'star' ? 0.45 : 0.28;
        const r = p.shape === 'twinkle' ? (s / 2) * Math.sin(Math.min(1, p.life / p.max) * Math.PI) : s / 2;
        g.beginPath();
        for (let i = 0; i < pts * 2; i++) {
          const rad = i % 2 === 0 ? r : r * inner;
          const a = -Math.PI / 2 + (i * Math.PI) / pts;
          if (i === 0) g.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else g.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        g.closePath();
        g.fill();
        break;
      }
    }
  }
}

export const fx = new Fx();
