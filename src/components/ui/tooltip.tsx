import React, { cloneElement } from 'react'

export function TooltipProvider({ children }:{children:React.ReactNode}){ return <>{children}</> }
export function Tooltip({ children }:{children:React.ReactNode}){ return <>{children}</> }
export function TooltipTrigger({ children, asChild=false }:{children:React.ReactNode; asChild?:boolean}){
  if(asChild && React.isValidElement(children)){
    const c:any = children
    return cloneElement(c, { title: c.props?.title ?? '' })
  }
  return <span>{children}</span>
}
export function TooltipContent({ children }:{children:React.ReactNode}){ return <>{children}</> }