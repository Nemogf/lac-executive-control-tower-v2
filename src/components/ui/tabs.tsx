import React, {createContext, useContext} from 'react'
import clsx from 'clsx'

type Ctx = { value: string; onChange: (v:string)=>void }
const TabsCtx = createContext<Ctx | null>(null)

export function Tabs({ value, onValueChange, children }:{value:string; onValueChange:(v:string)=>void; children:React.ReactNode}){
  return <TabsCtx.Provider value={{value, onChange:onValueChange}}>{children}</TabsCtx.Provider>
}
export function TabsList({ children }:{children:React.ReactNode}){
  return <div className="inline-flex items-center gap-2 p-1 rounded-2xl border bg-white">{children}</div>
}
export function TabsTrigger({ value, children }:{value:string; children:React.ReactNode}){
  const ctx = useContext(TabsCtx)!
  const active = ctx.value===value
  return (
    <button
      onClick={()=>ctx.onChange(value)}
      className={clsx('px-3 py-1.5 rounded-xl text-sm', active ? 'bg-black text-white' : 'text-black hover:bg-neutral-100')}
    >
      {children}
    </button>
  )
}