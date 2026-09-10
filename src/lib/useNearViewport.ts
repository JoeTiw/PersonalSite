import { useEffect, useState } from 'react'

/**
 * True while the element is within `margin` of the viewport.
 *
 * Used to mount and unmount WebGL canvases. Safari keeps every live context on the
 * GPU and composites its layer even when the canvas is idle or hidden, so holding
 * three at once is expensive there. Mounting a full viewport early means the scene
 * is ready before it can be seen, and gone once it is well past.
 */
export function useNearViewport(el: Element | null, margin = '100% 0px') {
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin: margin })
    io.observe(el)
    return () => io.disconnect()
  }, [el, margin])

  return near
}
