'use client'

import { useState } from 'react'
import { resetPassword } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const result = await resetPassword(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.success)
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <form action={handleSubmit}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-white">Reset Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center space-x-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md flex items-center space-x-2 text-green-500 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="name@example.com" 
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-primary/50"
                  required 
                />
              </div>

            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90" disabled={loading}>
                {loading ? "Sending link..." : "Send Reset Link"}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
