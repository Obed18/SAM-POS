import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://deno.land/x/supabase@v2.5.2/functions-utils/mod.ts'
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'

serve(async (req) => {
  const { email, password } = await req.json()

  if (!email || !password) {
    return new Response(JSON.stringify(null), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { data: user, error } = await supabaseClient
    .from('users')
    .select('password_hash, role')
    .eq('email', email)
    .single()

  if (error || !user) {
    return new Response(JSON.stringify(null), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const valid = await bcrypt.compare(password, user.password_hash)

  if (!valid) {
    return new Response(JSON.stringify(null), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ role: user.role }), {
    headers: { 'Content-Type': 'application/json' },
  })
})