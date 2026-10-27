const { test, before, after } = require('node:test')
const assert = require('node:assert')
const WebSocket = require('ws')
const { start, stub, json } = require('./helper')
const { parseArgs } = require('../server')

let app
before(async () => { app = await start() })
after(async () => { await app.close() })

test('image proxy streams the upstream body', async () => {
  const up = await stub((req, res) => { res.setHeader('content-type', 'image/png'); res.end('PNGDATA') })
  try {
    const r = await fetch(`${app.base}/rest/proxy/image?url=${encodeURIComponent(up.url + '/x.png')}`)
    assert.strictEqual(await r.text(), 'PNGDATA')
    const bad = await fetch(`${app.base}/rest/proxy/image?url=ftp://example.com/x`)
    assert.strictEqual(bad.status, 400)
  } finally { await up.close() }
})

test('webhook test posts a ping', async () => {
  let received
  const up = await stub((req, res) => {
    let b = ''
    req.on('data', (c) => { b += c })
    req.on('end', () => { received = JSON.parse(b); res.end('ok') })
  })
  try {
    const r = await fetch(`${app.base}/rest/webhook/test`, json({ url: up.url + '/hook' }))
    assert.deepStrictEqual(await r.json(), { delivered: true, status: 200 })
    assert.deepStrictEqual(received, { event: 'ping' })
  } finally { await up.close() }
})

test('exchange rates are fetched from RATES_URL', async () => {
  const up = await stub((req, res) => { res.setHeader('content-type', 'application/json'); res.end('{"EUR":0.92}') })
  process.env.RATES_URL = up.url
  try {
    assert.deepStrictEqual(await (await fetch(`${app.base}/rest/exchange-rate`)).json(), { EUR: 0.92 })
  } finally { delete process.env.RATES_URL; await up.close() }
})

test('order tracking websocket says hello and reports status', async () => {
  const ws = new WebSocket(`${app.base.replace('http', 'ws')}/ws/orders`)
  const messages = []
  await new Promise((resolve, reject) => {
    ws.on('error', reject)
    ws.on('message', (m) => {
      messages.push(JSON.parse(m))
      if (messages.length === 1) ws.send('7')
      else resolve()
    })
  })
  ws.close()
  assert.strictEqual(messages[0].type, 'hello')
  assert.deepStrictEqual(messages[1], { type: 'status', orderId: 7, state: 'shipped' })
})

test('CLI args are parsed', () => {
  assert.strictEqual(parseArgs([]).port, 3000)
  assert.strictEqual(parseArgs(['-p', '8080']).port, 8080)
})
