import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

import * as schema from './schema'

const url = process.env.TURSO_DATABASE_URL
if (!url) {
  throw new Error('TURSO_DATABASE_URL is not set')
}

export const db = drizzle({
  client: createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }),
  schema,
})
