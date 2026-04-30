import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — avoids module-level client creation during Next.js static build
let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    )
  }
  return _client
}

// Proxy so existing `supabase.from(...)` calls work without change
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export function createServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  )
}

/**
 * Fetches ALL rows from a Supabase table, paginating in chunks of 1000
 * to work around PostgREST's server-side max-rows cap.
 */
export async function fetchAll<T = Record<string, unknown>>(
  table: string,
  selectColumns: string,
  filters: { column: string; value: string }[] = []
): Promise<T[]> {
  const PAGE = 1000
  let all: T[] = []
  let from = 0

  while (true) {
    let query = getClient()
      .from(table)
      .select(selectColumns)
      .range(from, from + PAGE - 1)

    for (const f of filters) {
      query = query.eq(f.column, f.value) as typeof query
    }

    const { data, error } = await query

    if (error) {
      console.error(`fetchAll error on ${table}:`, error.message)
      break
    }
    if (!data || data.length === 0) break

    all = all.concat(data as T[])
    if (data.length < PAGE) break
    from += PAGE
  }

  return all
}
