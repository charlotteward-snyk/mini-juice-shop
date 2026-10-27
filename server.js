const http = require('http')
const minimist = require('minimist')
const WebSocket = require('ws')
const { createApp } = require('./src/app')

function createServer () {
  const server = http.createServer(createApp())
  const wss = new WebSocket.Server({ server, path: '/ws/orders' })
  wss.on('connection', (socket) => {
    socket.send(JSON.stringify({ type: 'hello', service: 'mini-juice-shop' }))
    socket.on('message', (msg) => {
      socket.send(JSON.stringify({ type: 'status', orderId: Number(msg), state: 'shipped' }))
    })
  })
  return server
}

function parseArgs (argv) {
  return minimist(argv, { default: { port: 3000 }, alias: { p: 'port' } })
}

if (require.main === module) {
  const { port } = parseArgs(process.argv.slice(2))
  createServer().listen(port, () => console.log(`mini-juice-shop listening on :${port}`))
}

module.exports = { createServer, parseArgs }
