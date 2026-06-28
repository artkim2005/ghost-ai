import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Key is versioned so that a stale singleton (created before a schema regeneration)
// is automatically abandoned and a fresh client is created with the current schema.
const SINGLETON_KEY = '__prisma_v29__'
const globalForPrisma = globalThis as unknown as Record<string, PrismaClient | undefined>

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL!
  if (url.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: url })
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
}

const prisma = globalForPrisma[SINGLETON_KEY] ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma[SINGLETON_KEY] = prisma
}

export default prisma
