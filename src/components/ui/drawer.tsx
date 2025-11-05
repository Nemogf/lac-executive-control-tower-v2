import React, {useState, cloneElement, isValidElement} from 'react'

export function Drawer({ children }:{children:React.ReactNode}){
  const [open,setOpen] = useState(false)
  let trigger:React.ReactNode=null, content:React.ReactNode=null
  React.Children.forEach(children, child => {
    if(!React.isValidElement(child)) return
    if((child as any).type.displayName==='DrawerTrigger') trigger = cloneElement(child, { onOpen:()=>setOpen(true) })
    if((child as any).type.displayName==='DrawerContent') content = cloneElement(child, { open, onClose:()=>setOpen(false) })
  })
  return <>{trigger}{content}</>
}

export function DrawerTrigger({ children, asChild=false, onOpen }:{children:React.ReactNode; asChild?:boolean; onOpen?:()=>void}){
  if(asChild && isValidElement(children)) {
    return React.cloneElement(children as any, { onClick: (e:any)=>{ (children as any).props?.onClick?.(e); onOpen && onOpen(); } })
  }
  return <button onClick={onOpen} className="px-3 py-2 rounded-xl border">Apri</button>
}
DrawerTrigger.displayName='DrawerTrigger'

export function DrawerContent({ children, open, onClose }:{children:React.ReactNode; open?:boolean; onClose?:()=>void}){
  return open ? (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border shadow-lg">
        {children}
      </div>
    </div>
  ) : null
}
DrawerContent.displayName='DrawerContent'

export function DrawerHeader({ children }:{children:React.ReactNode}){
  return <div className="p-4 border-b">{children}</div>
}
export function DrawerTitle({ children }:{children:React.ReactNode}){
  return <h3 className="text-base font-semibold">{children}</h3>
}