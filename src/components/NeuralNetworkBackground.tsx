import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
};

type PointerState = {
  x: number | null;
  y: number | null;
  radius: number;
};

const PARTICLE_COLOR = '#00ff9d';

const getNetworkSettings = (width: number) => ({
  particleCount: width < 768 ? 40 : 100,
  connectionDistance: width < 768 ? 90 : 130,
});

const createParticle = (width: number, height: number): Particle => {
  const size = Math.random() * 2 + 0.5;

  return {
    x: Math.random() * (width - size * 4) + size * 2,
    y: Math.random() * (height - size * 4) + size * 2,
    directionX: Math.random() * 0.6 - 0.3,
    directionY: Math.random() * 0.6 - 0.3,
    size,
  };
};

const drawParticle = (context: CanvasRenderingContext2D, particle: Particle) => {
  context.beginPath();
  context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2, false);
  context.fillStyle = PARTICLE_COLOR;
  context.fill();
};

const updateParticle = (particle: Particle, width: number, height: number, pointer: PointerState) => {
  if (particle.x > width || particle.x < 0) particle.directionX = -particle.directionX;
  if (particle.y > height || particle.y < 0) particle.directionY = -particle.directionY;

  if (pointer.x !== null && pointer.y !== null) {
    const dx = pointer.x - particle.x;
    const dy = pointer.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < pointer.radius + particle.size) {
      if (pointer.x < particle.x && particle.x < width - particle.size * 10) particle.x += 2;
      if (pointer.x > particle.x && particle.x > particle.size * 10) particle.x -= 2;
      if (pointer.y < particle.y && particle.y < height - particle.size * 10) particle.y += 2;
      if (pointer.y > particle.y && particle.y > particle.size * 10) particle.y -= 2;
    }
  }

  particle.x += particle.directionX;
  particle.y += particle.directionY;
};

export const NeuralNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) return;

    let animationFrameId = 0;
    let particles: Particle[] = [];
    let connectionDistance = getNetworkSettings(window.innerWidth).connectionDistance;
    const pointer: PointerState = { x: null, y: null, radius: 120 };

    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const settings = getNetworkSettings(width);

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      connectionDistance = settings.connectionDistance;
      particles = Array.from({ length: settings.particleCount }, () => createParticle(width, height));
    };

    const handleMouseMove = (event: MouseEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const handleTouchMove = () => {
      pointer.x = null;
      pointer.y = null;
    };

    const animate = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      animationFrameId = window.requestAnimationFrame(animate);
      context.clearRect(0, 0, width, height);

      for (const particle of particles) {
        updateParticle(particle, width, height, pointer);
        drawParticle(context, particle);
      }

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const distance =
            (particles[a].x - particles[b].x) * (particles[a].x - particles[b].x) +
            (particles[a].y - particles[b].y) * (particles[a].y - particles[b].y);

          if (distance < connectionDistance * connectionDistance) {
            const opacity = 1 - distance / (connectionDistance * connectionDistance);
            context.strokeStyle = `rgba(0, 255, 157, ${opacity * 0.25})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(particles[a].x, particles[a].y);
            context.lineTo(particles[b].x, particles[b].y);
            context.stroke();
          }
        }
      }
    };

    const passiveOptions: AddEventListenerOptions = { passive: true };

    window.addEventListener('mousemove', handleMouseMove, passiveOptions);
    window.addEventListener('touchmove', handleTouchMove, passiveOptions);
    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove, passiveOptions);
      window.removeEventListener('touchmove', handleTouchMove, passiveOptions);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none opacity-50" />;
};
