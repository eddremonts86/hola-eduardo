export function HomePage() {
  return (
    <div
      id="home"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f0f0f',
      }}
    >
      <h1
        style={{
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 'clamp(1.5rem, 5vw, 3rem)',
          fontWeight: 700,
          textAlign: 'center',
          padding: '0 1.5rem',
          letterSpacing: '-0.02em',
        }}
      >
        Hola, Eduardo te da la bienvenida
      </h1>
    </div>
  )
}
