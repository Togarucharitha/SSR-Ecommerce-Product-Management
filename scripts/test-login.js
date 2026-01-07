const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main() {
  const base = process.env.BASE_URL || 'http://localhost:3000'
  const url = `${base}/api/auth/login`
  const email = process.env.TEST_EMAIL || process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.TEST_PASSWORD || process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'

  console.log('POST', url)

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  const text = await res.text()
  console.log('Status:', res.status)
  console.log('Headers:', JSON.stringify(Object.fromEntries(res.headers.entries())))
  console.log('Body:', text)
}

main().catch((e)=>{console.error(e)})
