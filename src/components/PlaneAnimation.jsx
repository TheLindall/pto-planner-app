
const PLANE_STATES = {
  setup:    { rotate: 0,   y: 0,  groundY: 0,  groundOpacity: 1, planeX: 0,   planeOpacity: 1 },
  timeline: { rotate: -28, y: -4, groundY: 20, groundOpacity: 0, planeX: 0,   planeOpacity: 1 },
  about:    { rotate: -28, y: -4, groundY: 20, groundOpacity: 0, planeX: -28, planeOpacity: 0 },
}

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: 2,
}

export function PlaneAnimation({ activeTab }) {
  const s = PLANE_STATES[activeTab] || PLANE_STATES.setup
  const showSmile = activeTab === "about"
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        width: 28,
        height: 28,
        flexShrink: 0,
        overflow: "visible",
      }}
    >
      {/* Plane */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transformOrigin: "center center",
          transform: `rotate(${s.rotate}deg) translateY(${s.y}px) translateX(${s.planeX}px)`,
          opacity: s.planeOpacity,
          transition: reducedMotion ? "none" : "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path {...strokeProps} d="M3.88,17.23l-1.94-1.4-.02-4.47h1.23c.63-.01,1.23.28,1.61.79l.11.16c.38.51.98.8,1.61.8h1.26s-.03-6.7-.03-6.7h1.01c.76,0,1.45.42,1.79,1.1l2.28,4.47c.34.68,1.03,1.11,1.79,1.11h4.67c.6,0,1.18.22,1.63.62l.75.68c.58.52.63,1.4.11,1.98-.06.07-.13.14-.21.19l-.68.51c-.41.31-.91.49-1.44.49l-14.33.03c-.42,0-.83-.13-1.17-.38v.02Z"/>
        </svg>
      </span>

      {/* Ground */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          opacity: s.groundOpacity,
          transform: `translateY(${s.groundY}px)`,
          transition: reducedMotion ? "none" : "transform 0.6s ease-in-out, opacity 0.4s ease",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path {...strokeProps} d="M2,22h20"/>
        </svg>
      </span>

      {/* Smiley — slides in from right on About */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: showSmile ? 1 : 0,
          transform: showSmile ? "translateX(0px)" : "translateX(28px)",
          transition: reducedMotion ? "none" : "opacity 0.4s ease, transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path {...strokeProps} d="M3,16.3c.1.4.2.8,0,1.2l-1.1,3.3c-.1.5.2,1.1.8,1.2.2,0,.3,0,.5,0l3.4-1c.4,0,.7,0,1.1,0,5,2.3,11,.2,13.3-4.8,2.3-5,.2-11-4.8-13.3-5-2.3-11-.2-13.3,4.8-1.3,2.7-1.3,5.9,0,8.6"/>
          <path {...strokeProps} d="M8,14.2s1.5,2,4,2,4-2,4-2"/>
          <line {...strokeProps} x1="9" y1="10.2" x2="9" y2="10.2"/>
          <line {...strokeProps} x1="15" y1="10.2" x2="15" y2="10.2"/>
        </svg>
      </span>
    </span>
  )
}
