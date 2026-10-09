'use server'

import { createClient } from '@/utils/supabase/server'
import Papa from 'papaparse'

export async function validateImport(formData: FormData) {
  const file = formData.get('csvFile') as File
  if (!file) {
    return { error: "No file uploaded" }
  }

  const text = await file.text()
  
  const parseResult = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (parseResult.errors.length > 0) {
    return { error: `CSV Parsing error: ${parseResult.errors[0].message}` }
  }

  const rows = parseResult.data as any[]
  
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: "Unauthorized" }
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') return { error: "Forbidden: Admins only" }

  const { data: existingRegs } = await supabase
    .from('participant_registrations')
    .select('original_email')

  const existingEmails = new Set(existingRegs?.map(r => r.original_email.toLowerCase()) || [])

  const results = {
    total: rows.length,
    valid: 0,
    skipped: 0,
    duplicateCsv: 0,
    alreadyExisting: 0,
    invalid: 0,
    validRows: [] as any[],
    invalidRows: [] as any[]
  }

  const seenInCsv = new Set<string>()

  for (const row of rows) {
    const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email address'))
    const email = emailKey ? row[emailKey]?.trim() : null

    if (!email) {
      results.invalid++
      results.invalidRows.push({ row, reason: 'Missing email' })
      continue
    }

    const normalizedEmail = email.toLowerCase()
    
    // Check for malformed email (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      results.invalid++
      results.invalidRows.push({ row, reason: 'Invalid email format' })
      continue
    }

    if (seenInCsv.has(normalizedEmail)) {
      results.duplicateCsv++
      results.invalid++
      results.invalidRows.push({ row, reason: 'Duplicate in CSV' })
      continue
    }
    seenInCsv.add(normalizedEmail)

    if (existingEmails.has(normalizedEmail)) {
      results.alreadyExisting++
      results.skipped++
      results.invalidRows.push({ row, reason: 'Already exists in database' })
      continue
    }

    results.valid++
    results.validRows.push({
      original_email: normalizedEmail,
      registration_data: row
    })
  }

  return { success: true, results }
}

export async function executeImport(validRows: any[]) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return { error: "Unauthorized" }
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') return { error: "Forbidden: Admins only" }

  if (!validRows || validRows.length === 0) {
    return { error: 'No valid rows to import' }
  }

  // Double check duplicates before inserting
  const { data: existingRegs } = await supabase
    .from('participant_registrations')
    .select('original_email')

  const existingEmails = new Set(existingRegs?.map(r => r.original_email.toLowerCase()) || [])
  
  const toInsert = validRows.filter(r => !existingEmails.has(r.original_email))
  
  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('participant_registrations')
      .insert(toInsert)

    if (insertError) {
      return { error: `Failed to insert records: ${insertError.message}` }
    }
  }

  return { success: `Successfully imported ${toInsert.length} participants.` }
}
