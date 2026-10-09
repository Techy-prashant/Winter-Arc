'use client'

import { useState } from 'react'
import { validateImport, executeImport } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { UploadCloud, CheckCircle2, AlertCircle, FileWarning } from 'lucide-react'

export default function AdminImportPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [importResult, setImportResult] = useState<string | null>(null)

  async function handleValidate(formData: FormData) {
    setLoading(true)
    setError(null)
    setValidationResult(null)
    setImportResult(null)
    
    try {
      const response = await validateImport(formData)
      if (response.error) {
        setError(response.error)
      } else {
        setValidationResult(response.results)
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handleExecute() {
    setLoading(true)
    setError(null)
    try {
      const response = await executeImport(validationResult.validRows)
      if (response.error) {
        setError(response.error)
      } else {
        setImportResult(response.success || 'Import completed.')
        setValidationResult(null) // Clear preview on success
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Participant Import</h1>
        <p className="text-muted-foreground">Safely upload and validate Google Forms CSV to register new participants.</p>
      </header>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start space-x-3 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {importResult && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start space-x-3 text-green-500">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Import Successful</p>
            <p className="text-sm opacity-90">{importResult}</p>
          </div>
        </div>
      )}

      {!validationResult && !importResult && (
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <form action={handleValidate}>
            <CardHeader>
              <CardTitle className="text-white">Upload Registration Data</CardTitle>
              <CardDescription>
                Select the exported CSV file containing the official Winter Arc registrations.
                The system will validate the data first without performing destructive changes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="csvFile">CSV File</Label>
                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center text-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative">
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-white">Click to select CSV file</p>
                  <p className="text-xs text-muted-foreground mt-1">.csv format only</p>
                  <input 
                    id="csvFile" 
                    name="csvFile"
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept=".csv" 
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-primary text-black hover:bg-primary/90" 
                disabled={loading}
              >
                {loading ? "Validating..." : "Preview Import"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {validationResult && (
        <div className="space-y-6">
          <Card className="border-white/10 bg-black/40">
            <CardHeader>
              <CardTitle className="text-white">Validation Summary</CardTitle>
              <CardDescription>Review the analysis of the uploaded CSV file before importing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-white">{validationResult.total}</div>
                  <div className="text-xs text-muted-foreground uppercase">Total Rows</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-emerald-500">{validationResult.valid}</div>
                  <div className="text-xs text-muted-foreground uppercase">Valid to Import</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-500">{validationResult.alreadyExisting}</div>
                  <div className="text-xs text-muted-foreground uppercase">Already Existing</div>
                </div>
                <div className="bg-white/5 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-destructive">{validationResult.invalid}</div>
                  <div className="text-xs text-muted-foreground uppercase">Invalid / Duplicates</div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={handleExecute} 
                  className="flex-1 bg-emerald-500 text-white hover:bg-emerald-600"
                  disabled={loading || validationResult.valid === 0}
                >
                  {loading ? "Importing..." : `Confirm Import (${validationResult.valid} rows)`}
                </Button>
                <Button 
                  onClick={() => setValidationResult(null)} 
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {validationResult.invalidRows.length > 0 && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center text-lg">
                  <FileWarning className="w-5 h-5 mr-2" /> Invalid & Skipped Rows Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                  {validationResult.invalidRows.map((item: any, i: number) => {
                    const emailKey = Object.keys(item.row).find(k => k.toLowerCase().includes('email address'))
                    const email = emailKey ? item.row[emailKey] : 'No Email'
                    return (
                      <div key={i} className="p-3 bg-black/40 rounded border border-white/5 flex justify-between items-center text-sm">
                        <div>
                          <span className="text-white font-medium block">{email}</span>
                          <span className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-md block">
                            {JSON.stringify(item.row)}
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-destructive/20 text-destructive rounded text-xs ml-4 flex-shrink-0">
                          {item.reason}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
