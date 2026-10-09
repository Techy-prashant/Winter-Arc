'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'HOME', subtitle: 'Overview & Stats' },
  { href: '/check-in', label: 'CHECK-IN', subtitle: 'Log daily progress' },
  { href: '/progress', label: 'MISSIONS', subtitle: 'View challenges' },
  { href: '/feed', label: 'THREADS', subtitle: 'Community updates' },
  { href: '/leaderboard', label: 'LEADERBOARD', subtitle: 'Rankings & scores' },
  { href: '/profile', label: 'PROFILE', subtitle: 'Manage account' },
]

export function DesktopNav() {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`block px-4 py-3 rounded-lg border-l-2 transition-all ${
              isActive 
                ? 'border-white bg-white/5 text-white' 
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="text-xs tracking-[0.2em] font-bold">
              {item.label}
            </div>
            <div className={`text-[10px] mt-0.5 tracking-wider ${isActive ? 'text-white/70' : 'text-white/30'}`}>
              {item.subtitle}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  
  // Mobile nav usually omits leaderboard to fit on screen, matching original design
  const mobileItems = navItems.filter(item => item.label !== 'LEADERBOARD')

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#05070a]/90 backdrop-blur-xl z-50 flex justify-around p-3 text-[9px] tracking-wider uppercase font-medium pb-safe">
      {mobileItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        return (
          <Link 
            key={item.href}
            href={item.href} 
            className={`flex flex-col items-center justify-center gap-1 p-2 transition-colors ${
              isActive ? 'text-white' : 'text-white/40 hover:text-white/80'
            }`}
          >
            {/* If we had icons, they'd go here. Using a little dot indicator for active state instead */}
            <span className="relative">
              {item.label === 'HOME' ? 'Home' :
               item.label === 'MISSIONS' ? 'Missions' :
               item.label === 'CHECK-IN' ? 'Check-in' :
               item.label === 'THREADS' ? 'Threads' : 'Profile'}
               {isActive && (
                 <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>
               )}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
