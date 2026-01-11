import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

const env = process.env.NODE_ENV
const envFilename = `.env.${env}`
if (!env) {
  process.exit(1)
}
export const isProduction = env == 'production'
config({
  path: envFilename,
  override: true
})
