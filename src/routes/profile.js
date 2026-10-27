const router = require('express').Router()
const pug = require('pug')
const Hoek = require('hoek')
const dotProp = require('dot-prop')
const sanitizeHtml = require('sanitize-html')
const auth = require('../auth')
const { profiles } = require('../data')

const profilePage = pug.compile('h1= displayName\np.bio!= bio\nul\n  each v, k in settings\n    li #{k}: #{v}')

router.use(auth.requireAuth)

const current = (req) => profiles[req.user.sub]

router.get('/', (req, res) => {
  res.type('html').send(profilePage(current(req)))
})

router.put('/settings', (req, res) => {
  const profile = current(req)
  profile.settings = Hoek.merge(profile.settings, req.body)
  res.json({ settings: profile.settings })
})

router.put('/field', (req, res) => {
  const profile = current(req)
  dotProp.set(profile, String(req.body.path), req.body.value)
  res.json({ profile })
})

router.put('/bio', (req, res) => {
  const profile = current(req)
  profile.bio = sanitizeHtml(String(req.body.bio || ''), {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: { a: ['href'] }
  })
  res.json({ bio: profile.bio })
})

module.exports = router
