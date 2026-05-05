'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Fireworks Canvas ─────────────────────────────────────────────────────────

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  size: number
  decay: number
}

interface Firework {
  x: number
  y: number
  vy: number
  particles: Particle[]
  color: string
  exploded: boolean
}

function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fireworksRef = useRef<Firework[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COLORS = [
      '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
      '#c77dff', '#ff9f1c', '#e63946', '#06d6a0',
      '#118ab2', '#ef476f', '#ffd166', '#73d0fd',
    ]

    const launchRandom = () => {
      const x = Math.random() * canvas.width
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      fireworksRef.current.push({
        x,
        y: canvas.height,
        vy: -Math.random() * 12 - 8,
        particles: [],
        color,
        exploded: false,
      })
    }

    const explode = (fw: Firework) => {
      const count = 60 + Math.floor(Math.random() * 40)
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2
        const speed = Math.random() * 8 + 2
        fw.particles.push({
          x: fw.x,
          y: fw.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: fw.color,
          size: Math.random() * 3 + 1,
          decay: 0.012 + Math.random() * 0.008,
        })
      }
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(15, 15, 15, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Launch new fireworks
      if (Math.random() < 0.06) launchRandom()

      // Update fireworks
      fireworksRef.current = fireworksRef.current.filter(fw => {
        if (!fw.exploded) {
          fw.y += fw.vy
          fw.vy += 0.15 // gravity
          if (fw.vy >= 0 || fw.y < 0) {
            explode(fw)
            fw.exploded = true
          }
        } else {
          // Update particles
          fw.particles = fw.particles.filter(p => {
            p.x += p.vx
            p.y += p.vy
            p.vy += 0.1 // gravity
            p.alpha -= p.decay
            p.vx *= 0.99
            return p.alpha > 0
          })
          return fw.particles.length > 0
        }
        return true
      })

      // Draw
      for (const fw of fireworksRef.current) {
        if (!fw.exploded) {
          ctx.beginPath()
          ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = fw.color
          ctx.fill()
        } else {
          for (const p of fw.particles) {
            ctx.globalAlpha = p.alpha
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fillStyle = p.color
            ctx.fill()
          }
        }
      }
      ctx.globalAlpha = 1

      rafRef.current = requestAnimationFrame(animate)
    }

    // Launch initial burst
    for (let i = 0; i < 5; i++) {
      setTimeout(() => launchRandom(), i * 150)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

// ─── Floating Particles ───────────────────────────────────────────────────────

function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * -20,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: 'rgba(255,255,255,0.3)',
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Starfield background ─────────────────────────────────────────────────────

function Starfield() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * -3,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute bg-white rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Glow text ───────────────────────────────────────────────────────────────

function GlowText({ children, color = '#ffd93d' }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        textShadow: `
          0 0 10px ${color},
          0 0 20px ${color},
          0 0 40px ${color},
          0 0 80px ${color}
        `,
      }}
    >
      {children}
    </span>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export function HomePage() {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger confetti burst on load
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f0f 60%, #000000 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Background layers */}
      <Starfield />
      <FloatingParticles />
      <FireworksCanvas />

      {/* Confetti burst */}
      <AnimatePresence>
        {showConfetti && <ConfettiBurst />}
      </AnimatePresence>

      {/* Glowing center orb */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: 'backOut' }}
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
          zIndex: 2,
        }}
      />

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 2rem' }}>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}
        >
          👋 Bienvenido a
        </motion.p>

        {/* Main greeting */}
        <div style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
          <motion.h1
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{
              color: '#ffffff',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 900,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.05em',
            }}
          >
            <span style={{
              fontSize: 'clamp(4rem, 16vw, 12rem)',
              color: '#ffffff',
              textShadow: `
                0 0 10px rgba(255,255,255,0.8),
                0 0 30px rgba(255,255,255,0.5),
                0 0 60px rgba(255,255,255,0.3)
              `,
            }}>
              ¡Hola
            </span>
            <span style={{
              fontSize: 'clamp(5rem, 20vw, 16rem)',
              color: '#4da6ff',
              textShadow: `
                0 0 15px #4da6ff,
                0 0 40px #4da6ff,
                0 0 80px #4da6ff,
                0 0 120px rgba(77,166,255,0.5)
              `,
              lineHeight: 0.9,
            }}>
              Eduardo!
            </span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 'clamp(1rem, 3vw, 1.5rem)',
            fontWeight: 300,
            letterSpacing: '0.05em',
            maxWidth: 600,
          }}
        >
          Tu espacio de trabajo inteligente está listo.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          style={{ marginTop: '3rem' }}
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full"
            style={{
              background: 'rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#ffd93d',
                boxShadow: '0 0 10px #ffd93d',
              }}
            />
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
              Sistema activo y funcionando
            </span>
          </div>
        </motion.div>

        {/* Scrolling stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            marginTop: '4rem',
            display: 'flex',
            gap: '3rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { value: '100%', label: 'Operativo' },
            { value: '24/7', label: 'Monitoreo' },
            { value: '∞', label: 'Posibilidades' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + i * 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{
                fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                fontWeight: 800,
                color: '#ffd93d',
                lineHeight: 1,
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.4)',
                marginTop: '0.3rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        background: 'linear-gradient(to top, rgba(15,15,15,1) 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 5,
      }} />

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-40px) translateX(15px); opacity: 0.6; }
          50% { transform: translateY(-20px) translateX(-10px); opacity: 0.4; }
          75% { transform: translateY(-60px) translateX(5px); opacity: 0.7; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  )
}

// ─── Confetti Burst ───────────────────────────────────────────────────────────

function ConfettiBurst() {
  const pieces = Array.from({ length: 60 }, (_, i) => {
    const angle = (i / 60) * Math.PI * 2
    const velocity = 4 + Math.random() * 6
    const colors = ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff', '#c77dff']
    return {
      id: i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20,
    }
  })

  return (
    <>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{
            x: p.x,
            y: p.y,
            opacity: 1,
            rotate: p.rotation,
            scale: 1,
          }}
          animate={{
            x: p.x + p.vx * 120,
            y: p.y + p.vy * 120 + 200,
            opacity: 0,
            rotate: p.rotation + p.rotationSpeed * 3,
            scale: 0.3,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}