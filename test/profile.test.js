const { test, before, after } = require('node:test')
const assert = require('node:assert')
const { start, token, json } = require('./helper')

let app, auth
before(async () => {
  app = await start()
  auth = { authorization: `Bearer ${await token(app.base)}` }
})
after(async () => { await app.close() })

test('profile requires authentication', async () => {
  assert.strictEqual((await fetch(`${app.base}/api/profile`)).status, 401)
})

test('profile page renders via pug', async () => {
  const html = await (await fetch(`${app.base}/api/profile`, { headers: auth })).text()
  assert.match(html, /<h1>Jim<\/h1>/)
  assert.match(html, /theme: light/)
})

test('settings are merged', async () => {
  const r = await fetch(`${app.base}/api/profile/settings`, { ...json({ theme: 'dark' }, auth), method: 'PUT' })
  assert.deepStrictEqual((await r.json()).settings, { theme: 'dark', newsletter: true })
})

test('profile fields can be set by path', async () => {
  const r = await fetch(`${app.base}/api/profile/field`, { ...json({ path: 'settings.newsletter', value: false }, auth), method: 'PUT' })
  assert.strictEqual((await r.json()).profile.settings.newsletter, false)
})

test('bio is sanitised', async () => {
  const r = await fetch(`${app.base}/api/profile/bio`, {
    ...json({ bio: '<b>hi</b><script>alert(1)</script><a href="https://snyk.io" onclick="x()">s</a>' }, auth),
    method: 'PUT'
  })
  assert.strictEqual((await r.json()).bio, '<b>hi</b><a href="https://snyk.io">s</a>')
})
