const express = require('express')
const path = require('path')

function createApp () {
  const app = express()
  const nm = (p) => path.join(__dirname, '..', 'node_modules', p)

  app.use(express.json())
  app.use('/vendor/jquery', express.static(nm('jquery/dist')))
  app.use('/vendor/bootstrap', express.static(nm('bootstrap/dist')))
  app.use(express.static(path.join(__dirname, '..', 'public')))

  app.use('/rest/products', require('./routes/products'))
  app.use('/rest/user', require('./routes/user'))
  app.use('/api/feedbacks', require('./routes/feedback'))
  app.use('/api/profile', require('./routes/profile'))
  app.use('/rest/orders', express.text({ type: ['application/xml', 'text/xml'] }), require('./routes/orders'))
  app.use('/rest/admin', express.text({ type: ['text/yaml', 'text/plain'] }), require('./routes/admin'))
  app.use('/rest', require('./routes/network'))
  app.use('/', require('./routes/files'))

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message })
  })

  return app
}

module.exports = { createApp }
