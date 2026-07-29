import { useEffect, useState } from "react"

// Matches the app's `sm` breakpoint (640px). Desktop = pointer/dialog UI;
// below it = touch/drawer UI and native form controls.
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 640px)").matches)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)")
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isDesktop
}
