const httpServer = require('http').createServer()
const io = require("socket.io")(httpServer, {
    cors: {
        // The origin is the same as the Vue app domain. Change if necessary
        origin: "http://localhost:5174",
        methods: ["GET", "POST"],
        credentials: true
    }
})
httpServer.listen(8080, () => {
    console.log('listening on *:8080')
})
io.on('connection', (socket) => {
    console.log(`client ${socket.id} has connected`)
    socket.on('loggedIn', function (user, socketId) {
        if (user == null) {
            if (socketId == null) {
                socket.join(socket.id)
                console.log(`client ${socket.id} has joined room ${socket.id}`)
                socket.emit('nonCostumerGetId', socket.id)
                return
            }
            socket.join(socketId)
            console.log(`client ${socketId} has joined room ${socketId}`)
            return
        }
        socket.join(user.id)
        console.log(`client ${socket.id} has joined room ${user.id}`)
        if (user.type == 'EC') {
            socket.join('cookers')
            console.log(`client ${socket.id} has joined room cookers`)
        }
    })
    socket.on('loggedOut', function (user) {
        socket.leave(user.id)
        socket.leave('cookers')
    })

    //when order is created notify all cookers
    socket.on('orderCreated', function (order) {
        socket.to('cookers').emit('orderCreated', order.data.order)
    })
    // when order is ready notify the user
    socket.on('orderReady', function (order) {
        if (order.userId != null) {
            socket.to(order.userId).emit('orderReady', order.order)
        } else {
            socket.to(JSON.parse(order.order.custom)).emit('orderReady', order.order)
        }
    })
})