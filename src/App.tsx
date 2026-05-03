import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { memberProjects } from './data/memberProjects';

// ==========================================
// 0. クラッシュ対策：外部アイコンパッケージを排除し、すべてインラインSVGで定義
// ==========================================
const IconGithub = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.15-.38 6.5-1.4 6.5-7a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5.6 3.3 6.6 6.5 7a4.8 4.8 0 0 0-1 3.03V22"/><path d="M9 20c-5 1.5-5-2.5-7-3"/></svg>
);
const IconMessageCircle = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
);
const IconArrowUpRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M7 7h10v10"/><path d="M17 7 7 17"/></svg>
);
const IconZap = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
);
const IconActivity = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/></svg>
);

// ==========================================
// 1. Global CSS
// ==========================================
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

  :root {
    --bg-color: #030303;
    --primary: #00ff9d;
    --secondary: #7000ff;
  }

  html {
    margin: 0;
    padding: 0;
    overflow-x: clip;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--bg-color);
    color: #ffffff;
    overflow-x: clip;
    font-family: 'Inter', -apple-system, sans-serif;
    overscroll-behavior-y: auto;
  }

  .font-mono { font-family: 'Space Mono', monospace; }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; }

  /* 軽量グリッチテキストエフェクト */
  .glitch-text {
    position: relative;
    display: inline-block;
  }
  .glitch-text::before, .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }
  .glitch-text::before {
    left: 2px;
    text-shadow: -2px 0 var(--primary);
    clip-path: inset(20% 0 80% 0);
    animation: glitch-anim-1 3s infinite linear alternate-reverse;
  }
  .glitch-text::after {
    left: -2px;
    text-shadow: -2px 0 var(--secondary);
    clip-path: inset(80% 0 1% 0);
    animation: glitch-anim-2 4s infinite linear alternate-reverse;
  }
  @keyframes glitch-anim-1 {
    0% { clip-path: inset(10% 0 80% 0); transform: translate(-2px, 1px); }
    20% { clip-path: inset(80% 0 5% 0); transform: translate(1px, -1px); }
    40% { clip-path: inset(30% 0 50% 0); transform: translate(-1px, 2px); }
    60% { clip-path: inset(100% 0 1% 0); transform: translate(2px, -2px); }
    80% { clip-path: inset(5% 0 70% 0); transform: translate(-2px, 1px); }
    100% { clip-path: inset(40% 0 20% 0); transform: translate(1px, -1px); }
  }
  @keyframes glitch-anim-2 {
    0% { clip-path: inset(20% 0 60% 0); transform: translate(2px, -1px); }
    20% { clip-path: inset(60% 0 10% 0); transform: translate(-1px, 2px); }
    40% { clip-path: inset(10% 0 80% 0); transform: translate(2px, 1px); }
    60% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, -1px); }
    80% { clip-path: inset(50% 0 30% 0); transform: translate(1px, 2px); }
    100% { clip-path: inset(5% 0 90% 0); transform: translate(-1px, -2px); }
  }

  .glass-panel {
    background: rgba(20, 20, 20, 0.4);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  }
`;

// ==========================================
// 2. 外部ライブラリ非依存の Canvas ネットワーク
// ==========================================
const NeuralNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctxMaybe = canvas.getContext('2d');
    if (!ctxMaybe) return;
    const context = ctxMaybe;

    let animationFrameId: number;
    let particlesArray: Particle[] = [];

    const isMobile = window.innerWidth < 768;
    const numberOfParticles = isMobile ? 40 : 100;
    const connectionDistance = isMobile ? 90 : 130;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mouse = { x: null as number | null, y: null as number | null, radius: 120 };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    const handleTouchMove = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const passiveScrollSafe: AddEventListenerOptions = { passive: true };
    window.addEventListener('mousemove', handleMouseMove, passiveScrollSafe);
    window.addEventListener('touchmove', handleTouchMove, passiveScrollSafe);

    class Particle {
      x: number;
      y: number;
      directionX: number;
      directionY: number;
      size: number;
      color: string;

      constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }
      draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
      }
      update() {
        if (this.x > canvas!.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas!.height || this.y < 0) this.directionY = -this.directionY;

        if (mouse.x != null && mouse.y != null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius + this.size) {
            if (mouse.x < this.x && this.x < canvas!.width - this.size * 10) this.x += 2;
            if (mouse.x > this.x && this.x > this.size * 10) this.x -= 2;
            if (mouse.y < this.y && this.y < canvas!.height - this.size * 10) this.y += 2;
            if (mouse.y > this.y && this.y > this.size * 10) this.y -= 2;
          }
        }
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    function init() {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 0.5;
        const x = Math.random() * (window.innerWidth - size * 4) + size * 2;
        const y = Math.random() * (window.innerHeight - size * 4) + size * 2;
        const directionX = Math.random() * 0.6 - 0.3;
        const directionY = Math.random() * 0.6 - 0.3;
        particlesArray.push(new Particle(x, y, directionX, directionY, size, '#00ff9d'));
      }
    }

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }

      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const distance =
            (particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x) +
            (particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y);

          if (distance < connectionDistance * connectionDistance) {
            opacityValue = 1 - distance / (connectionDistance * connectionDistance);
            context.strokeStyle = `rgba(0, 255, 157, ${opacityValue * 0.25})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(particlesArray[a].x, particlesArray[a].y);
            context.lineTo(particlesArray[b].x, particlesArray[b].y);
            context.stroke();
          }
        }
      }
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('resize', handleResize);
    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove, passiveScrollSafe);
      window.removeEventListener('touchmove', handleTouchMove, passiveScrollSafe);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-50" />;
};

// ==========================================
// 3. UI Components
// ==========================================

const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 200);
          return 100;
        }
        return prev + 25;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center pointer-events-none"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-[#00ff9d] font-mono text-5xl font-black tracking-tighter">{Math.min(progress, 100)}%</h1>
    </motion.div>
  );
};

const RevealText = ({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true, margin: '-30px' }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

const Header = () => (
  <header className="fixed top-0 left-0 w-full p-4 md:p-8 flex justify-between items-center z-50 pointer-events-none bg-gradient-to-b from-black/75 via-black/35 to-transparent backdrop-blur-[2px]">
    <div className="flex items-center gap-3 pointer-events-auto">
      <div className="w-10 h-10 rounded-full border-2 border-[#00ff9d] overflow-hidden bg-black shrink-0">
        <img src="/icon.png" alt="AI野郎" className="w-full h-full object-cover" />
      </div>
      <div className="font-black text-xl tracking-widest uppercase text-white">AI野郎</div>
    </div>
    <div className="hidden md:flex gap-8 font-mono text-xs tracking-widest uppercase pointer-events-auto text-white">
      <a href="#about" className="hover:text-[#00ff9d] transition-colors">
        About
      </a>
      <a href="#activities" className="hover:text-[#00ff9d] transition-colors">
        Activities
      </a>
      <a href="#projects" className="hover:text-[#00ff9d] transition-colors">
        Projects
      </a>
      <a href="#token" className="hover:text-[#00ff9d] transition-colors">
        Token
      </a>
    </div>
  </header>
);

// ==========================================
// 4. Main Sections
// ==========================================

const Hero = () => (
  <section className="relative min-h-[100svh] flex flex-col items-center justify-center z-10 px-4 pt-20">
    <div className="text-center w-full max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
        <div className="font-mono text-[#00ff9d] tracking-[0.3em] md:tracking-[0.5em] text-xs md:text-sm mb-4 uppercase">
          相対性理論 学べ！
        </div>
      </motion.div>

      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}>
        <h1 className="text-6xl sm:text-8xl md:text-[12vw] font-black leading-[0.8] tracking-tighter uppercase glitch-text" data-text="AI野郎">
          AI野郎
        </h1>
      </motion.div>

      <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }}>
        <p className="mt-8 text-gray-300 text-sm md:text-base leading-relaxed px-4 mx-auto max-w-lg">
          A radical community exploring the frontiers of Artificial Intelligence, Neuroscience, Medicine, and Physics. Born in Keio University,
          2025.
        </p>
      </motion.div>
    </div>

    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 font-mono text-[10px]"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <span>SCROLL DOWN</span>
      <div className="w-[1px] h-10 bg-gradient-to-b from-gray-500 to-transparent" />
    </motion.div>
  </section>
);

const About = () => (
  <section id="about" className="relative py-20 md:py-32 px-4 md:px-10 z-10">
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <RevealText>
          <h2 className="text-4xl sm:text-6xl font-black mb-6 leading-tight uppercase">
            Beyond <br />
            <span className="text-[#00ff9d]">Boundaries</span>
          </h2>
        </RevealText>
        <RevealText delay={0.1}>
          <div className="glass-panel p-6 rounded-2xl mb-6 border-l-4 border-l-[#7000ff]">
            <p className="text-gray-200 text-sm leading-relaxed">
              2025年に慶應義塾大学理工学部情報工学科の有志により設立。学生から社会人まで、様々なバックグラウンドを持つメンバーが集結するコミュニティです。
            </p>
          </div>
        </RevealText>
        <RevealText delay={0.2}>
          <p className="text-gray-400 text-sm leading-relaxed pl-2">
            我々の探求はコンピュータサイエンスに留まりません。神経科学、医療、物理学など、多岐にわたる分野のプロフェッショナルや探求者が交わり、先端技術の実践と知見を共有しています。
          </p>
        </RevealText>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {[
          { icon: IconActivity, title: 'Neuroscience', desc: '神経科学' },
          { icon: IconActivity, title: 'Medicine', desc: '医療応用' },
          { icon: IconZap, title: 'Physics', desc: '物理学' },
          { icon: IconGithub, title: 'Computer Sci', desc: '情報工学' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <RevealText key={i} delay={0.1 + i * 0.1}>
              <div className="glass-panel p-5 md:p-6 rounded-xl hover:border-[#00ff9d] transition-colors h-full">
                <Icon className="w-6 h-6 md:w-8 md:h-8 text-[#00ff9d] mb-3 md:mb-4" />
                <h3 className="font-bold text-sm md:text-base mb-1">{item.title}</h3>
                <p className="text-[10px] md:text-xs text-gray-500">{item.desc}</p>
              </div>
            </RevealText>
          );
        })}
      </div>
    </div>
  </section>
);

const Activities = () => (
  <section id="activities" className="relative py-20 md:py-32 px-4 md:px-10 z-10 bg-gradient-to-b from-transparent to-[#111111]/80">
    <div className="max-w-6xl mx-auto">
      <RevealText>
        <h2 className="text-xs font-mono text-[#00ff9d] tracking-widest mb-2">CORE ACTIVITIES</h2>
      </RevealText>
      <RevealText delay={0.1}>
        <div className="text-3xl md:text-5xl font-black mb-10 md:mb-16">DYNAMIC INTERACTION</div>
      </RevealText>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RevealText delay={0.2}>
          <div className="glass-panel h-full rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-[-50%] right-[-20%] w-64 h-64 bg-[#00ff9d] rounded-full filter blur-[100px] opacity-20" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <IconMessageCircle className="w-6 h-6 text-[#00ff9d]" />
                <h3 className="text-xl md:text-2xl font-bold">LINE Community</h3>
              </div>
              <p className="text-gray-300 text-sm">日々の技術的なディスカッション、最新情報の共有、そして雑談。活発なオンライン交流の場。</p>
            </div>
            <div className="mt-10 relative z-10 flex items-end justify-between border-t border-white/10 pt-6">
              <div>
                <div className="text-4xl md:text-5xl font-black text-white">124</div>
                <div className="text-[10px] font-mono text-gray-400 mt-1">ACTIVE MEMBERS</div>
              </div>
              <div className="flex items-center gap-2 bg-[#00ff9d]/10 px-3 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff9d] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff9d]"></span>
                </span>
                <span className="text-[10px] font-mono text-[#00ff9d] font-bold">ONLINE</span>
              </div>
            </div>
          </div>
        </RevealText>

        <RevealText delay={0.3}>
          <div className="glass-panel h-[350px] md:h-full rounded-3xl overflow-hidden relative group p-0 flex flex-col justify-end border-gray-800">
            <img
              src="/event.jpg"
              alt="Offline Meetups の集合写真"
              className="absolute inset-0 w-full h-full object-cover z-0"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />

            <div className="relative z-20 p-6 md:p-8">
              <div className="inline-block px-2 py-1 bg-[#7000ff]/30 border border-[#7000ff]/50 rounded text-[10px] font-mono mb-3 text-white">
                HELD TWICE
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Offline Meetups</h3>
              <p className="text-gray-300 text-xs md:text-sm">
                画面を越えた熱狂。多様な専門分野を持つメンバーが直接顔を合わせ、未来の技術について語り合う対面交流会。
              </p>
            </div>
          </div>
        </RevealText>
      </div>
    </div>
  </section>
);

const Token = () => (
  <section id="token" className="relative py-24 md:py-32 z-10 px-4">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#7000ff] rounded-full filter blur-[120px] md:blur-[200px] opacity-30 pointer-events-none" />

    <div className="max-w-4xl mx-auto text-center relative z-10 glass-panel p-8 md:p-16 rounded-3xl border border-[#7000ff]/30">
      <RevealText>
        <div className="mx-auto mb-6 w-full rounded-2xl border border-[#00ff9d] bg-black shadow-[0_0_40px_rgba(0,255,157,0.12)]">
          <img
            src="/token.png"
            alt="Official Token"
            className="block w-full h-auto max-w-full object-contain"
          />
        </div>
      </RevealText>
      <RevealText delay={0.1}>
        <h2 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">Official Token</h2>
      </RevealText>
      <RevealText delay={0.2}>
        <p className="text-gray-300 text-sm md:text-base mb-8 max-w-lg mx-auto">
          具体的な用途は未定。しかし、我々のコミュニティのポテンシャルを象徴するデジタルの証。
        </p>
      </RevealText>
      <RevealText delay={0.3}>
        <a
          href="https://pump.fun/coin/Ev3BaMn4ttzWAjt8aDHy7M6UE5utfTvzcmEiTh2opump"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex bg-[#00ff9d] text-black px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-base items-center gap-2 transition-transform active:scale-95 hover:bg-white"
        >
          VIEW ON PUMP.FUN <IconArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
        </a>
      </RevealText>
    </div>
  </section>
);

const Projects = () => (
  <section id="projects" className="relative py-20 md:py-32 z-10 px-4 md:px-10 border-t border-white/10 bg-gradient-to-b from-black to-[#0a0a0a]">
    <div className="max-w-6xl mx-auto">
      <RevealText>
        <h2 className="text-xs font-mono text-[#00ff9d] tracking-widest mb-2">PROJECT</h2>
      </RevealText>
      <RevealText delay={0.05}>
        <p className="text-3xl md:text-5xl font-black mb-4">コミュニティの挑戦</p>
      </RevealText>
      <RevealText delay={0.1}>
        <p className="text-gray-500 text-xs md:text-sm mb-10 max-w-2xl leading-relaxed">
          メンバーが個別に取り組むプロジェクトをカードで紹介します。追加・更新はリポジトリの{' '}
          <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-gray-400">src/data/memberProjects.ts</code>{' '}
          を編集し、Pull Request を送ってください。
        </p>
      </RevealText>

      {memberProjects.length === 0 ? (
        <p className="text-gray-500 text-sm">まだ登録がありません。`memberProjects` 配列にエントリを追加してください。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {memberProjects.map((p, i) => (
            <RevealText key={p.id} delay={0.05 * Math.min(i, 8)}>
              <article className="glass-panel p-5 md:p-6 rounded-2xl h-full flex flex-col border border-white/5 transition-colors hover:border-[#00ff9d]/35">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold leading-snug text-white md:text-xl">{p.title}</h3>
                  <time className="shrink-0 whitespace-nowrap font-mono text-[10px] text-gray-500" dateTime={p.updatedAt}>
                    {p.updatedAt}
                  </time>
                </div>
                <p className="mb-4 flex-1 text-xs leading-relaxed text-gray-300 md:text-sm">{p.description}</p>
                <p className="mb-3 font-mono text-[10px] text-[#00ff9d]">— {p.member}</p>
                {p.tags && p.tags.length > 0 ? (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={`${p.id}-${t}`}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-gray-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-white transition-colors hover:text-[#00ff9d]"
                  >
                    リンクを開く <IconArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </article>
            </RevealText>
          ))}
        </div>
      )}
    </div>
  </section>
);

const ContributeSection = () => (
  <section className="relative z-10 border-t border-white/10 bg-black py-20 md:py-32">
    <div className="mb-16 w-full -rotate-1 transform overflow-hidden bg-[#00ff9d] py-2 text-black">
      <div className="flex animate-[scroll_20s_linear_infinite] whitespace-nowrap">
        <style>{`@keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
        {[...Array(2)].map((_, j) => (
          <div key={j} className="flex shrink-0">
            {[...Array(6)].map((_, i) => (
              <span key={i} className="flex items-center gap-4 px-4 text-xl font-black uppercase tracking-widest">
                OPEN SOURCE PROJECT <IconZap className="h-5 w-5" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>

    <div className="mx-auto max-w-6xl px-4 md:px-10">
      <RevealText>
        <div className="glass-panel mx-auto max-w-3xl rounded-2xl border-l-4 border-l-[#00ff9d] p-6 md:p-8">
          <h3 className="mb-3 text-2xl font-bold">Contribute</h3>
          <p className="mb-6 text-xs text-gray-400 md:text-sm">
            AI野郎のWebサイトはオープンソースです。メンバーによる自発的で積極的な更新を歓迎します。限界を突破するコードをPushしてください。
          </p>
          <a href="#" className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-bold text-black active:bg-gray-200">
            <IconGithub className="h-3 w-3" /> GITHUB REPO
          </a>
        </div>
      </RevealText>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-8 text-center bg-black border-t border-white/5 relative z-10">
    <div className="font-mono text-gray-600 text-[10px] tracking-widest px-4 leading-relaxed">
      © 2025 AI YARO. ALL RIGHTS RESERVED.
      <br />
      ESTABLISHED BY KEIO UNIVERSITY STUDENTS & ALUMNI.
    </div>
  </footer>
);

// ==========================================
// 5. App Component
// ==========================================
export default function App() {
  const [loading, setLoading] = useState(true);
  const handleLoadComplete = useCallback(() => setLoading(false), []);

  return (
    <>
      <style>{globalStyles}</style>

      <AnimatePresence>{loading && <Loader onComplete={handleLoadComplete} />}</AnimatePresence>

      <NeuralNetworkBackground />

      <div
        className={`relative z-10 transition-opacity duration-1000 ${loading ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <Header />
        <main>
          <Hero />
          <About />
          <Activities />
          <Token />
          <Projects />
          <ContributeSection />
        </main>
        <Footer />
      </div>
    </>
  );
}
