const { test, before, after } = require('node:test')
const assert = require('node:assert')
const { start, token, json } = require('./helper')

let app
before(async () => { app = await start() })
after(async () => { await app.close() })

test('product search returns labelled results with an ETA', async () => {
  const r = await fetch(`${app.base}/rest/products/search?q=juice`)
  const body = await r.json()
  assert.strictEqual(r.status, 200)
  assert.ok(body.data.length >= 3)
  assert.match(body.data[0].label, /Apple Juice .* - \$1\.99/)
  assert.match(body.data[0].eta, /^\d{4}-\d{2}-\d{2}$/)
})

test('product categories are grouped', async () => {
  const body = await (await fetch(`${app.base}/rest/products/categories`)).json()
  assert.deepStrictEqual(Object.keys(body).sort(), ['gadget', 'juice', 'merch'])
})

test('login succeeds for a known user and rejects bad credentials', async () => {
  const ok = await fetch(`${app.base}/rest/user/login`, json({ email: 'jim@mini-juice.sh', password: 'ncc-1701' }))
  assert.strictEqual(ok.status, 200)
  const bad = await fetch(`${app.base}/rest/user/login`, json({ email: 'jim@mini-juice.sh', password: 'nope' }))
  assert.strictEqual(bad.status, 401)
  const malformed = await fetch(`${app.base}/rest/user/login`, json({ email: 'not-an-email', password: 'x' }))
  assert.strictEqual(malformed.status, 401)
})

test('whoami requires a valid JWT', async () => {
  const anon = await fetch(`${app.base}/rest/user/whoami`)
  assert.strictEqual(anon.status, 401)
  const t = await token(app.base)
  const r = await fetch(`${app.base}/rest/user/whoami`, { headers: { authorization: `Bearer ${t}` } })
  assert.strictEqual(r.status, 200)
  assert.strictEqual((await r.json()).user.email, 'jim@mini-juice.sh')
})

test('feedback markdown is rendered and script tags are neutralised', async () => {
  const r = await fetch(`${app.base}/api/feedbacks`, json({ comment: '**great** juice <script>alert(1)</script>' }))
  const { data } = await r.json()
  assert.strictEqual(r.status, 201)
  assert.match(data.html, /<strong>great<\/strong>/)
  assert.doesNotMatch(data.html, /<script/i)
})

test('order receipt, email and notification render', async () => {
  const receipt = await (await fetch(`${app.base}/rest/orders/1/receipt`)).text()
  assert.match(receipt, /Receipt #1 for jim@mini-juice\.sh/)
  assert.match(receipt, /2 x Apple Juice/)
  const email = await (await fetch(`${app.base}/rest/orders/1/email`)).text()
  assert.match(email, /order #1 with 2 line item/)
  const notify = await fetch(`${app.base}/rest/orders/2/notify`, { method: 'POST' })
  assert.strictEqual(notify.status, 200)
  assert.strictEqual((await notify.json()).message.to[0].address, 'bender@mini-juice.sh')
  assert.strictEqual((await fetch(`${app.base}/rest/orders/99/receipt`)).status, 404)
})

test('XML order import parses attributes and items', async () => {
  const xml = '<order customer="jim@mini-juice.sh"><item sku="apple" qty="3"/><item sku="press" qty="1"/></order>'
  const r = await fetch(`${app.base}/rest/orders/import-xml`, {
    method: 'POST', headers: { 'content-type': 'application/xml' }, body: xml
  })
  assert.deepStrictEqual(await r.json(), {
    status: 'imported',
    customer: 'jim@mini-juice.sh',
    items: [{ sku: 'apple', qty: 3 }, { sku: 'press', qty: 1 }]
  })
})

test('static vendor assets are served', async () => {
  for (const p of ['/vendor/jquery/jquery.min.js', '/vendor/bootstrap/css/bootstrap.min.css', '/']) {
    assert.strictEqual((await fetch(`${app.base}${p}`)).status, 200, p)
  }
})
