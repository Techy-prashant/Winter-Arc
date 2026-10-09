import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#05070a] text-gray-200 overflow-hidden font-sans selection:bg-blue-900/50">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#05070a] z-10 shrink-0">
        <div className="p-8 pb-4">
          <div className="text-xs tracking-[0.2em] font-medium uppercase text-white/50 mb-1">NAMDAPHA</div>
          <div className="text-xl font-medium tracking-tight text-white">WINTER ARC</div>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          <NavItem href="/dashboard" label="HOME" />
          <NavItem href="/check-in" label="CHECK-IN" />
          <NavItem href="/progress" label="MISSIONS" />
          <NavItem href="/feed" label="THREADS" />
          <NavItem href="/leaderboard" label="LEADERBOARD" />
          <NavItem href="/profile" label="PROFILE" />
        </nav>
        
        <div className="p-6 border-t border-white/5 space-y-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 rounded-full border border-white/10">
              <AvatarFallback className="bg-transparent text-xs text-white/50 rounded-full">US</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] uppercase tracking-wider text-white truncate">{user.email}</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button 
              type="submit" 
              className="text-[10px] tracking-wider uppercase text-white/40 hover:text-white transition-colors flex items-center"
            >
              <LogOut size={12} className="mr-2" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative bg-[#0a0c10]">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        <div className="p-6 md:p-12 relative z-10 max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#05070a]/90 backdrop-blur-xl z-50 flex justify-around p-4 text-[10px] tracking-wider uppercase font-medium">
        <Link href="/dashboard" className="text-white/50 hover:text-white">Home</Link>
        <Link href="/progress" className="text-white/50 hover:text-white">Missions</Link>
        <Link href="/check-in" className="text-white/50 hover:text-white">Check-in</Link>
        <Link href="/feed" className="text-white/50 hover:text-white">Threads</Link>
        <Link href="/profile" className="text-white/50 hover:text-white">Profile</Link>
      </div>
    </div>
  )
}

function NavItem({ href, label }: { href: string, label: string }) {
  return (
    <Link 
      href={href} 
      className="block px-4 py-3 text-xs tracking-[0.2em] font-medium text-white/50 hover:text-white hover:bg-white/5 transition-colors"
    >
      {label}
    </Link>
  )
}
