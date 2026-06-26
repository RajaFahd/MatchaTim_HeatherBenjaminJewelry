const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./authRepository');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_please_change_me';

class AuthService {
  async register({ email, password, name, role }) {
    if (!email || !password || !name) {
      throw new Error('Email, password, and name are required.');
    }

    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    return authRepository.createUser({
      email,
      passwordHash,
      name,
      role
    });
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }

    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
}

module.exports = new AuthService();
