const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const CryptoJS = require('crypto-js')
const validator = require('validator')
const { users } = require('./data')

const SECRET = process.env.JWT_SECRET || 'mini-juice-shop-secret'
const SALT = 'mini-juice-salt'

const hashPassword = (password) =>
  CryptoJS.PBKDF2(password, SALT, { keySize: 256 / 32, iterations: 1000 }).toString()

const passwordHashes = new Map(users.map((u) => [u.email, hashPassword(u.password)]))

function login (email, password) {
  if (!validator.isEmail(String(email))) return null
  const user = users.find((u) => u.email === email)
  if (!user || passwordHashes.get(email) !== hashPassword(String(password))) return null
  const token = jwt.sign({ sub: user.email, role: user.role }, SECRET, { expiresIn: '1h' })
  return { token, user: { email: user.email, role: user.role } }
}

function verify (token) {
  return jwt.verify(token, SECRET)
}

const requireAuth = expressJwt({ secret: SECRET })

module.exports = { login, verify, requireAuth, hashPassword }
