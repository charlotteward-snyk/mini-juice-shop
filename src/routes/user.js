const router = require('express').Router()
const auth = require('../auth')

router.post('/login', (req, res) => {
  const result = auth.login(req.body.email, req.body.password)
  if (!result) return res.status(401).json({ error: 'Invalid email or password' })
  res.json({ authentication: result })
})

router.get('/whoami', auth.requireAuth, (req, res) => {
  res.json({ user: { email: req.user.sub, role: req.user.role } })
})

module.exports = router
