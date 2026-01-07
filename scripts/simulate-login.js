const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const email = process.env.TEST_EMAIL || 'admin@example.com'
  const password = process.env.TEST_PASSWORD || 'admin123'
  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    console.log('User from DB:', JSON.stringify(user, null, 2))
    if (!user) return console.log('No user')

    const isBcrypt = user.password && user.password.startsWith('$2')
    console.log('Password appears hashed (bcrypt):', isBcrypt)

    let ok = false
    if (isBcrypt) {
      ok = await bcrypt.compare(password, user.password)
    } else {
      ok = user.password === password
      if (ok) {
        const newHash = await bcrypt.hash(password, 10)
        await prisma.user.update({ where: { id: user.id }, data: { password: newHash } })
        console.log('Migrated password to bcrypt for', email)
      }
    }

    console.log('Password match:', ok)
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
