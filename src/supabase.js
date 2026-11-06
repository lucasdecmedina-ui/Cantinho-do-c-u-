import { createClient } from '@supabase/supabase-js'

// A chave pública identifica o projeto; as permissões ficam no banco.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://owchfdplwysfmfvuigji.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_0HEKsBwe9THPnqj6GCbZYw_UNtaXt7n'

export const supabase = createClient(url, key)
