const express = require("express");
const cors = require('cors');
const path = require('path')
const {
    createServer
} = require("http");
const {
    Server
} = require("socket.io");
const {
    setRecord
} =
require('./db')
const roomRouter = require('./router')
const app = express();
const httpServer = createServer(app);
app.use(cors())
app.use(express.static(path.join(__dirname, 'assets')))
const io = new Server(httpServer, {
    cors: {
        origin: `http://localhost:3000`
    }
});
console.log(path.join(__dirname, 'file'));
var startIo = ''
var roomID = ''
app.get('/room/recordroom', (req, res) => {
    roomID = req.query[0]
    if (startIo == '') {
        startIo = function () {
            io.on("connection", (socket) => {

                socket.join(roomID)
                socket.on("message", (msg) => {
                    socket.to(msg.room).emit("message", msg);
                    msg.uid = socket.id
                    setRecord(msg)
                });
                socket.on('disconnect', () => {
                    socket.leave(roomID)
                })
            });
        }
        startIo()
    }
    res.send({})
})

app.use('/room', roomRouter)



httpServer.listen(3001);