import { defineConfig } from 'prisma/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || ''

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: connectionString,
  },
})