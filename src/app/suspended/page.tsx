import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-destructive/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="z-10 bg-black/40 backdrop-blur-xl border border-destructive/20 p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl">
        <div className="h-16 w-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Account Suspended</h1>
          <p className="text-muted-foreground">
            Your access to the Winter Arc has been revoked due to a violation of the goals or 3 consecutive missed check-ins.
          </p>
        </div>
        
        <div className="pt-4 space-y-3">
          <Link href="mailto:support@namdapha.com" className="w-full">
            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
              Contact Support
            </Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" className="w-full text-muted-foreground hover:text-white">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
