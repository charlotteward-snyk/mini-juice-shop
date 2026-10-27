const http = require('http')
const { createServer } = require('../server')

async function start () {
  const server = createServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  return { server, base, close: () => new Promise((resolve) => server.close(resolve)) }
}

// Tiny stub upstream used by the outbound-HTTP tests (no real network needed).
async function stub (handler) {
  const server = http.createServer(handler)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((resolve) => server.close(resolve)) }
}

async function token (base, email = 'jim@mini-juice.sh', password = 'ncc-1701') {
  const r = await fetch(`${base}/rest/user/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return (await r.json()).authentication.token
}

const json = (body, headers = {}) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body)
})

module.exports = { start, stub, token, json }

// Builds a "stored" (uncompressed) zip by hand so the fixture doesn't depend on the
// library under test; some adm-zip versions can't write archives on modern Node.
function crc32 (buf) {
  let c, crc = 0xffffffff
  for (const byte of buf) {
    c = (crc ^ byte) & 0xff
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1
    crc = (crc >>> 8) ^ c
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeZip (files) {
  const locals = []
  const centrals = []
  let offset = 0
  for (const [name, content] of Object.entries(files)) {
    const n = Buffer.from(name)
    const d = Buffer.from(content)
    const crc = crc32(d)
    const lh = Buffer.alloc(30)
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4)
    lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(d.length, 18); lh.writeUInt32LE(d.length, 22)
    lh.writeUInt16LE(n.length, 26)
    const ch = Buffer.alloc(46)
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6)
    ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(d.length, 20); ch.writeUInt32LE(d.length, 24)
    ch.writeUInt16LE(n.length, 28); ch.writeUInt32LE(offset, 42)
    locals.push(lh, n, d)
    centrals.push(ch, n)
    offset += 30 + n.length + d.length
  }
  const cd = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(Object.keys(files).length, 8); end.writeUInt16LE(Object.keys(files).length, 10)
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, cd, end])
}

module.exports.makeZip = makeZip
