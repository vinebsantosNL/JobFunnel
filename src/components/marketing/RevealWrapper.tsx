'use client'

import { useEffect, useRef } from 'react'

interface RevealWrapperProps {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li'
}

export function RevealWrapper({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: RevealWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('reveal-show'), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    // @ts-expect-error — dynamic tag
    <Tag ref={ref} className={`reveal-init ${className}`}>
      {children}
    </Tag>
  )
}
