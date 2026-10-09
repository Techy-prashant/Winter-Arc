'use client'

import { useState } from 'react'
import { provisionAccounts } from './actions'

export default function ProvisionPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleProvision = async () => {
    setLoading(true)
    const res = await provisionAccounts()
    setResult(res)
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Account Provisioning</h1>
        <p className="text-sm text-muted-foreground">Automatically generate unique passwords and create accounts for imported participants.</p>
      </header>

      <div className="bg-black/40 border border-white/10 p-6 rounded-md">
        <p className="text-sm text-white/80 mb-6">
          This tool will scan the database for imported CSV registrations that do not have an account yet. 
          It will generate a unique password (e.g., <strong>Winter-X92F</strong>), create their account, and display the credentials below so you can email them.
        </p>

        <button 
          onClick={handleProvision}
          disabled={loading}
          className="bg-white text-black font-semibold text-sm px-6 py-3 hover:bg-white/90 disabled:opacity-50 transition-colors uppercase tracking-widest"
        >
          {loading ? "PROVISIONING..." : "PROVISION NEW ACCOUNTS"}
        </button>

        {result?.error && (
          <div className="mt-6 text-red-400 text-sm">{result.error}</div>
        )}

        {result?.success && (
          <div className="mt-8">
            <h3 className="text-emerald-400 font-medium mb-4">{result.message}</h3>
            
            {result.provisioned?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-y border-white/10">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3 font-mono">Password (Copy this)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.provisioned.map((user: any, i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white">{user.fullName}</td>
                        <td className="px-4 py-3 text-white/70">{user.email}</td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{user.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
