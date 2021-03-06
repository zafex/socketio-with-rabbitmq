let BROKER_DSN = process.env.BROKER_DSN === undefined ? 'amqp://localhost:5672/' : process.env.BROKER_DSN
let WEBSOCKET_PORT = process.env.WEBSOCKET_PORT === undefined ? 19914 : process.env.WEBSOCKET_PORT

let amqp = require('amqp')
let socket = require('socket.io')

// listen io to port
let io = socket(WEBSOCKET_PORT)
console.info('socket listen on port ' + WEBSOCKET_PORT)

// rabbitmq connection
let broker = amqp.createConnection(BROKER_DSN)

// handle error
broker.on('error', function(e) {
  console.log("Error from amqp: ", e)
})

// handle when connection rabbitmq ready
broker.on('ready', () => {
  broker.queue('notification.queue', {autoDelete: false, durable: true}, (queue) => {
    queue.subscribe(message => {
      io.emit('new message', message)
    })
  })
})

io.on('connection', client => {
  console.log('client connected')
  // when client "send message"
  client.on('send message', (message) => {
    // public "new message" to all client
    io.emit('new message', message)
  })
  // handle client disconnected
  client.on('disconnect', () => {
    console.log('client disconnected')
  })
})
