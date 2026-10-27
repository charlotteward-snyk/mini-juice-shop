const router = require('express').Router()
const _ = require('lodash')
const underscore = require('underscore')
const moment = require('moment')
const { products } = require('../data')

const labelTemplate = _.template('<%= name %> - $<%= price %>')

router.get('/search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase()
  const matches = _.filter(products, (p) =>
    p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  res.json({
    status: 'success',
    data: matches.map((p) => ({
      ...p,
      label: labelTemplate(p),
      eta: moment().add(p.shippingDays, 'days').format('YYYY-MM-DD')
    }))
  })
})

router.get('/categories', (req, res) => {
  const grouped = underscore.groupBy(products, 'category')
  res.json(underscore.mapObject(grouped, (list) => list.map((p) => p.name)))
})

module.exports = router
