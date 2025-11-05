import React from 'react'
import clsx from 'clsx'

export function Card({ className, style, children }:{className?:string; style?:React.CSSProperties; children:React.ReactNode}) {
  return <div className={clsx('bg-white border rounded-2xl shadow-sm', className)} style={style}>{children}</div>
}
export function CardHeader({ className, style, children }:{className?:string; style?:React.CSSProperties; children:React.ReactNode}) {
  return <div className={clsx('p-4 border-b', className)} style={style}>{children}</div>
}
export function CardTitle({ className, style, children }:{className?:string; style?:React.CSSProperties; children:React.ReactNode}) {
  return <h3 className={clsx('text-base font-semibold', className)} style={style}>{children}</h3>
}
export function CardContent({ className, style, children }:{className?:string; style?:React.CSSProperties; children:React.ReactNode}) {
  return <div className={clsx('p-4', className)} style={style}>{children}</div>
}