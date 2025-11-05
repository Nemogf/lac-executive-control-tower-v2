import React from 'react'
import clsx from 'clsx'

export function Badge({ className, children, variant='default', style }:{className?:string; children:React.ReactNode; variant?:'default'|'outline'; style?:React.CSSProperties}) {
  const base='inline-flex items-center rounded-full px-2 py-0.5 text-xs border'
  const styles = variant==='outline' ? 'bg-white border-neutral-300 text-neutral-700' : 'bg-neutral-900 text-white border-neutral-900'
  return <span className={clsx(base, styles, className)} style={style}>{children}</span>
}