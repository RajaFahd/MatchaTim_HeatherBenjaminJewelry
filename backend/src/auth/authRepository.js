const prisma = require('../config/prisma');

class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async createUser({ email, passwordHash, name, role }) {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || 'manager'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
  }
}

module.exports = new AuthRepository();
