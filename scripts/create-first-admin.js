/**
 * Script to create the first admin user via API
 * 
 * Usage:
 *   node scripts/create-first-admin.js
 * 
 * Or with custom values:
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=securepassword ADMIN_NAME="Admin User" BASE_URL=https://your-domain.com node scripts/create-first-admin.js
 */

const https = require('https')
const http = require('http')

// Prefer new DEFAULT_ADMIN_* env vars but keep backward compatibility with ADMIN_*
const email = process.env.DEFAULT_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@example.com'
const password = process.env.DEFAULT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123'
const name = process.env.DEFAULT_ADMIN_NAME || process.env.ADMIN_NAME || 'Admin User'
// const baseUrl = process.env.BASE_URL || process.env.VERCEL_URL 
//   ? `https://${process.env.VERCEL_URL}` 
//   : 'http://localhost:3000'
const BASE_URL =
  process.env.BASE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null)

if (!BASE_URL) {
  console.error("❌ BASE_URL is not set")
  process.exit(1)
}

const url = new URL(`${BASE_URL}/api/admin/create-admin`)

const data = JSON.stringify({
  name,
  email,
  password,
})

const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
}

console.log('Creating first admin user...')
console.log(`URL: ${url.toString()}`)
console.log(`Email: ${email}`)
console.log(`Name: ${name}`)
console.log('')

const requestModule = url.protocol === 'https:' ? https : http

const req = requestModule.request(options, (res) => {
  let responseData = ''

  res.on('data', (chunk) => {
    responseData += chunk
  })

  res.on('end', () => {
    try {
      const result = JSON.parse(responseData)
      
      if (res.statusCode === 200 && result.success) {
        console.log('✅ Admin user created successfully!')
        console.log('')
        console.log('📝 Login credentials:')
        console.log(`Email: ${email}`)
        console.log(`Password: ${password}`)
        console.log('')
        console.log('⚠️  Please change the default password after first login!')
        console.log('')
        console.log('User details:')
        console.log(JSON.stringify(result.user, null, 2))
      } else {
        console.error('❌ Failed to create admin user')
        console.error(`Status: ${res.statusCode}`)
        console.error(`Error: ${result.error || 'Unknown error'}`)
        if (result.details) {
          console.error('Details:', result.details)
        }
        process.exit(1)
      }
    } catch (error) {
      console.error('❌ Failed to parse response')
      console.error('Response:', responseData)
      console.error('Error:', error.message)
      process.exit(1)
    }
  })
})

req.on('error', (error) => {
  console.error('❌ Request failed:')
  console.error(error.message)
  console.error('')
  console.error('Make sure:')
  console.error('1. The server is running')
  console.error('2. BASE_URL is set correctly (or VERCEL_URL for Vercel deployments)')
  console.error('3. The API endpoint is accessible')
  process.exit(1)
})

req.write(data)
req.end()

