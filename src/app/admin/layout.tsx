import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Shield, Database, Users, LayoutDashboard, Flag } from 'lucide-react'
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // For testing purposes, we might temporarily allow anyone if the DB is empty
  // but strictly speaking:
  if (profile?.role !== 'admin') {
    // If not admin, redirect to normal app
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-destructive/20 bg-black/40 backdrop-blur-md z-10">
        <div className="p-6 flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-destructive flex items-center justify-center">
            <Shield className="h-5 w-5 text-black" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">HQ Control</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem href="/admin/import" icon={<Database size={20} />} label="Data Import" />
          <NavItem href="/admin/provision" icon={<Users size={20} />} label="Provision Accounts" />
          <NavItem href="/admin/participants" icon={<Users size={20} />} label="Participants" />
          <NavItem href="/admin/moderation" icon={<Flag size={20} />} label="Moderation" />
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-white flex items-center">
             ← Return to App
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-destructive/10 to-transparent pointer-events-none" />
        <div className="p-4 md:p-8 relative z-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-muted-foreground hover:bg-white/5 hover:text-white"
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
