import React from 'react'
import clsx from 'clsx'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default'|'outline'|'ghost'
  size?: 'default'|'sm'|'icon'
}
export function Button({ className, variant='default', size='default', ...props }:Props){
  const base='inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm shadow-sm transition border'
  const variants={
    default:'bg-black text-white border-black/10 hover:bg-black/90',
    outline:'bg-white text-black border-neutral-300 hover:bg-neutral-50',
    ghost:'bg-transparent text-black border-transparent hover:bg-neutral-100'
  }
  const sizes={ default:'h-9', sm:'h-8 text-sm px-2', icon:'h-9 w-9 p-0' }
  return <button className={clsx(base, variants[variant], sizes[size], className)} {...props} />
}