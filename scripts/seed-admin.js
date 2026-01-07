/**
 * Seed script to create an initial admin user
 * 
 * Usage: node scripts/seed-admin.js
 * 
 * Or with custom values:
 * ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=securepassword ADMIN_NAME="Admin User" node scripts/seed-admin.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Prefer new DEFAULT_ADMIN_* env vars but keep backward compatibility with ADMIN_*
  const email = process.env.DEFAULT_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@example.com'
  const password = process.env.DEFAULT_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123'
  const name = process.env.DEFAULT_ADMIN_NAME || process.env.ADMIN_NAME || 'Admin User'

  console.log('Creating admin user...')
  console.log(`Email: ${email}`)
  console.log(`Name: ${name}`)

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  })

  if (existingAdmin) {
    console.log('❌ Admin user already exists with this email!')
    console.log('To update the password, delete the user first or use a different email.')
    process.exit(1)
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    },
  })

  console.log('✅ Admin user created successfully!')
  console.log(`ID: ${admin.id}`)
  console.log(`Email: ${admin.email}`)
  console.log(`Role: ${admin.role}`)
  console.log('\n📝 Login credentials:')
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log('\n⚠️  Please change the default password after first login!')
}

main()
  .catch((e) => {
    console.error('Error creating admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

