#!/usr/bin/env node

/**
 * Quick test script to verify the /api/_admin/create-admin endpoint is accessible
 * Run after dev server starts: node test-admin-api.js
 */

const http = require('http')

const BASE_URL = 'http://localhost:3000'

// Test 1: GET endpoint (health check)
function testGET() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/_admin/create-admin',
      method: 'GET',
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log('\n✓ GET /api/_admin/create-admin')
        console.log(`  Status: ${res.statusCode}`)
        console.log(`  Content-Type: ${res.headers['content-type']}`)
        try {
          const parsed = JSON.parse(data)
          console.log(`  Response:`, JSON.stringify(parsed, null, 2))
          resolve(true)
        } catch (e) {
          console.log(`  ✗ Response is not JSON:`, data.slice(0, 100))
          resolve(false)
        }
      })
    })

    req.on('error', (err) => {
      console.log(`\n✗ GET request failed:`, err.message)
      resolve(false)
    })

    req.end()
  })
}

// Test 2: POST with valid data
function testPOST() {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      name: 'Test Admin',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123',
    })

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/_admin/create-admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log('\n✓ POST /api/_admin/create-admin')
        console.log(`  Status: ${res.statusCode}`)
        console.log(`  Content-Type: ${res.headers['content-type']}`)
        try {
          const parsed = JSON.parse(data)
          console.log(`  Response:`, JSON.stringify(parsed, null, 2))
          resolve(true)
        } catch (e) {
          console.log(`  ✗ Response is not JSON:`, data.slice(0, 100))
          resolve(false)
        }
      })
    })

    req.on('error', (err) => {
      console.log(`\n✗ POST request failed:`, err.message)
      resolve(false)
    })

    req.write(payload)
    req.end()
  })
}

// Test 3: POST with invalid data
function testPOSTInvalid() {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      name: 'Test',
      email: 'invalid-email',
      password: '123', // too short
    })

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/_admin/create-admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log('\n✓ POST with invalid data')
        console.log(`  Status: ${res.statusCode}`)
        console.log(`  Content-Type: ${res.headers['content-type']}`)
        try {
          const parsed = JSON.parse(data)
          console.log(`  Response:`, JSON.stringify(parsed, null, 2))
          if (res.statusCode === 400 && parsed.success === false) {
            console.log(`  ✓ Correctly rejected invalid data`)
            resolve(true)
          }
        } catch (e) {
          console.log(`  ✗ Response is not JSON:`, data.slice(0, 100))
          resolve(false)
        }
      })
    })

    req.on('error', (err) => {
      console.log(`\n✗ POST request failed:`, err.message)
      resolve(false)
    })

    req.write(payload)
    req.end()
  })
}

async function runTests() {
  console.log('\n' + '='.repeat(60))
  console.log('Testing /api/_admin/create-admin endpoint')
  console.log('='.repeat(60))

  try {
    const test1 = await testGET()
    await new Promise(r => setTimeout(r, 500))
    
    const test2 = await testPOST()
    await new Promise(r => setTimeout(r, 500))
    
    const test3 = await testPOSTInvalid()

    console.log('\n' + '='.repeat(60))
    console.log('Summary:')
    console.log(`  GET health check: ${test1 ? '✓' : '✗'}`)
    console.log(`  POST valid data: ${test2 ? '✓' : '✗'}`)
    console.log(`  POST invalid data: ${test3 ? '✓' : '✗'}`)
    console.log('='.repeat(60) + '\n')

    if (test1 && test2 && test3) {
      console.log('✓ All tests passed! Endpoint is working correctly.')
    } else {
      console.log('✗ Some tests failed. Check server logs for details.')
    }
  } catch (err) {
    console.error('Test error:', err)
  }

  process.exit(0)
}

console.log('Waiting for server to respond...\n')
setTimeout(runTests, 1000)
