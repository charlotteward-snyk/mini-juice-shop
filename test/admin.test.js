const { test, before, after } = require('node:test')
const assert = require('node:assert')
const { start } = require('./helper')

let app
before(async () => { app = await start() })
after(async () => { await app.close() })

const post = (path, body, type) =>
  fetch(`${app.base}/rest/admin${path}`, { method: 'POST', headers: { 'content-type': type }, body })

test('YAML config import', async () => {
  const r = await post('/config/yaml', 'name: shop\nfeatures:\n  - basket\n  - chatbot\n', 'text/yaml')
  assert.deepStrictEqual((await r.json()).config, { name: 'shop', features: ['basket', 'chatbot'] })
})

test('YAML config import rejects JS-specific tags', async () => {
  const r = await post('/config/yaml', 'x: !!js/function "function () { return 1 }"\n', 'text/yaml')
  assert.strictEqual(r.status, 400)
})

test('INI config import', async () => {
  const r = await post('/config/ini', '[server]\nport=8080\n', 'text/plain')
  assert.deepStrictEqual((await r.json()).config, { server: { port: '8080' } })
})

test('state is serialised safely into a script tag', async () => {
  const html = await (await fetch(`${app.base}/rest/admin/state?motd=${encodeURIComponent('</script><b>x')}`)).text()
  assert.doesNotMatch(html.replace(/^<script>/, '').replace(/<\/script>$/, ''), /<\/script>/)
})

test('coupon digest is sha256', async () => {
  const body = await (await fetch(`${app.base}/rest/admin/coupon?code=abc`)).json()
  assert.strictEqual(body.digest, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
})

test('health check', async () => {
  assert.deepStrictEqual(await (await fetch(`${app.base}/rest/admin/health`)).json(), { status: 'ok', node: true })
})
