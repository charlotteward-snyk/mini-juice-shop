const router = require('express').Router()
const axios = require('axios')
const request = require('request')
const fetch = require('node-fetch')
const validator = require('validator')

const isHttpUrl = (u) =>
  validator.isURL(String(u), { protocols: ['http', 'https'], require_protocol: true, require_tld: false })

router.get('/proxy/image', (req, res) => {
  if (!isHttpUrl(req.query.url)) return res.status(400).json({ error: 'invalid url' })
  request.get(req.query.url)
    .on('error', () => res.status(502).json({ error: 'upstream error' }))
    .pipe(res)
})

router.post('/webhook/test', async (req, res) => {
  if (!isHttpUrl(req.body.url)) return res.status(400).json({ error: 'invalid url' })
  try {
    const response = await axios.post(req.body.url, { event: 'ping' }, { timeout: 2000 })
    res.json({ delivered: true, status: response.status })
  } catch (e) {
    res.status(502).json({ delivered: false })
  }
})

router.get('/exchange-rate', async (req, res) => {
  try {
    const response = await fetch(process.env.RATES_URL || 'http://localhost:0/rates')
    res.json(await response.json())
  } catch (e) {
    res.status(502).json({ error: 'rates unavailable' })
  }
})

module.exports = router
