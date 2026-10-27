const router = require('express').Router()
const yaml = require('js-yaml')
const ini = require('ini')
const serialize = require('serialize-javascript')
const forge = require('node-forge')
const shell = require('shelljs')

router.post('/config/yaml', (req, res) => {
  try {
    res.json({ config: yaml.safeLoad(String(req.body)) })
  } catch (e) {
    res.status(400).json({ error: 'Invalid YAML' })
  }
})

router.post('/config/ini', (req, res) => {
  res.json({ config: ini.parse(String(req.body)) })
})

router.get('/state', (req, res) => {
  const state = { shop: 'mini-juice-shop', motd: String(req.query.motd || 'Welcome!') }
  res.type('html').send(`<script>window.__STATE__ = ${serialize(state)}</script>`)
})

router.get('/coupon', (req, res) => {
  const md = forge.md.sha256.create()
  md.update(String(req.query.code || ''))
  res.json({ digest: md.digest().toHex() })
})

router.get('/health', (req, res) => {
  res.json({ status: 'ok', node: Boolean(shell.which('node')) })
})

module.exports = router
