const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupAdminUser() {
  try {
    console.log('🔍 Checking for existing admin user...')
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      console.log(`Username: ${existingAdmin.username}`)
      console.log(`Role: ${existingAdmin.role}`)
      console.log(`Status: ${existingAdmin.isActive ? 'Active' : 'Inactive'}`)
      return
    }

    console.log('👤 Creating default admin user...')
    
    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'replaceme123'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@eniolabi.com',
        name: 'System Administrator',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log(`Username: ${adminUser.username}`)
    console.log(`Role: ${adminUser.role}`)
    console.log(`ID: ${adminUser.id}`)
    console.log('\n🔐 Default credentials:')
    console.log('Username: admin')
    console.log(`Password: ${adminPassword}`)
    console.log('\n⚠️  IMPORTANT: Change this password after first login!')

  } catch (error) {
    console.error('❌ Error setting up admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup
setupAdminUser()
