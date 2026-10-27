const { test, before, after } = require('node:test')
const assert = require('node:assert')
const { start, makeZip } = require('./helper')

let app
before(async () => { app = await start() })
after(async () => { await app.close() })

const form = (field, name, data) => {
  const f = new FormData()
  f.append(field, new Blob([data]), name)
  return { method: 'POST', body: f }
}

test('complaint upload via multer', async () => {
  const r = await fetch(`${app.base}/file-upload`, form('file', 'complaint.txt', 'my juice is warm'))
  assert.deepStrictEqual(await r.json(), { name: 'complaint.txt', size: 16 })
})

test('profile image upload via express-fileupload', async () => {
  const r = await fetch(`${app.base}/profile/image-upload`, form('file', 'me.png', 'abc'))
  const body = await r.json()
  assert.strictEqual(body.name, 'me.png')
  assert.strictEqual(body.size, 3)
})

test('backup archive inspection lists zip entries', async () => {
  const zip = makeZip({ 'a/one.txt': '1', 'two.txt': '2' })
  const r = await fetch(`${app.base}/rest/backup/inspect`, form('archive', 'b.zip', zip))
  assert.deepStrictEqual((await r.json()).entries.sort(), ['a/one.txt', 'two.txt'])
})

test('backup tarball is gzip', async () => {
  const r = await fetch(`${app.base}/ftp/backup.tgz`)
  const buf = Buffer.from(await r.arrayBuffer())
  assert.strictEqual(buf[0], 0x1f)
  assert.strictEqual(buf[1], 0x8b)
})
