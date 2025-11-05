import React from 'react'
import clsx from 'clsx'

export function Input({ className, ...props } : React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx('w-full border rounded-2xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300', className)} {...props} />
}