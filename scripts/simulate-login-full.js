const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

async function main(){
  const prisma = new PrismaClient()
  try{
    const email = 'admin@example.com'
    const password = 'admin123'
    const user = await prisma.user.findUnique({where:{email}})
    console.log('user',user)
    if(!user) return console.log('no user')
    const match = await bcrypt.compare(password, user.password)
    console.log('bcrypt compare result',match)
    const token = jwt.sign({userId:user.id,email:user.email,role:user.role},JWT_SECRET,{expiresIn:'7d'})
    console.log('token length', token.length)
  }catch(e){console.error(e)}finally{await prisma.$disconnect()}
}
main()
