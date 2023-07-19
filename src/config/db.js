// eslint-disable-next-line no-unused-expressions
const { Pool } = require('pg')
const { createClient } = require('@supabase/supabase-js')

console.log(process.env.SUPABASE_URL)

const pool = new Pool({
  user: process.env.PGUSERNAME,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
})

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

module.exports = { pool, supabase }
