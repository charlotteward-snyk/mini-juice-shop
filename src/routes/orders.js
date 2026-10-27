const router = require('express').Router()
const ejs = require('ejs')
const handlebars = require('handlebars')
const nodemailer = require('nodemailer')
const xml2js = require('xml2js')
const { DOMParser } = require('xmldom')
const { orders } = require('../data')

const receiptTemplate =
  'Receipt #<%= id %> for <%= customer %>\n' +
  '<% items.forEach(function (i) { %><%= i.qty %> x <%= i.name %> @ <%= i.price %>\n<% }) %>'

const emailTemplate = handlebars.compile(
  'Hi {{customer}}, your order #{{id}} with {{items.length}} line item(s) is on its way!')

const transport = nodemailer.createTransport({ jsonTransport: true })

const findOrder = (req, res) => {
  const order = orders.find((o) => o.id === Number(req.params.id))
  if (!order) res.status(404).json({ error: 'Order not found' })
  return order
}

router.get('/:id/receipt', (req, res) => {
  const order = findOrder(req, res)
  if (order) res.type('text').send(ejs.render(receiptTemplate, order))
})

router.get('/:id/email', (req, res) => {
  const order = findOrder(req, res)
  if (order) res.type('text').send(emailTemplate(order))
})

router.post('/:id/notify', async (req, res) => {
  const order = findOrder(req, res)
  if (!order) return
  const info = await transport.sendMail({
    from: 'shop@mini-juice.sh',
    to: order.customer,
    subject: `Order #${order.id}`,
    text: emailTemplate(order)
  })
  res.json({ status: 'queued', message: JSON.parse(info.message) })
})

router.post('/import-xml', (req, res) => {
  const xml = String(req.body)
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const customer = doc.documentElement.getAttribute('customer')
  xml2js.parseString(xml, (err, parsed) => {
    if (err) return res.status(400).json({ error: 'Invalid XML' })
    const items = (parsed.order.item || []).map((i) => ({ sku: i.$.sku, qty: Number(i.$.qty) }))
    res.json({ status: 'imported', customer, items })
  })
})

module.exports = router
