const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const email = process.env.CHECK_EMAIL || 'admin@example.com'
    const user = await prisma.user.findUnique({ where: { email } })
    console.log(JSON.stringify(user, null, 2))
  } catch (err) {
    console.error('ERROR', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
