import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ejqrvmkjypdfqiiwyxkp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqcXJ2bWtqeXBkZnFpaXd5eGtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MzM0NDEsImV4cCI6MjA4MzUwOTQ0MX0.sDOLfczDLK4RNIHFLP-kG1_rnZNWhE4XFImruLBr8oA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
