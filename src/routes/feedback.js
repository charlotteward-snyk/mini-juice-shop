const router = require('express').Router()
const marked = require('marked')
const { feedback } = require('../data')

router.post('/', (req, res) => {
  const comment = String(req.body.comment || '')
  if (!comment) return res.status(400).json({ error: 'comment required' })
  const entry = { id: feedback.length + 1, html: marked(comment, { sanitize: true }) }
  feedback.push(entry)
  res.status(201).json({ status: 'success', data: entry })
})

router.get('/', (req, res) => {
  res.json({ status: 'success', data: feedback })
})

module.exports = router
