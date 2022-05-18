const express = require("express");
const cors = require('cors');
// const config = require("config-yml")
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
const io = new Server(httpServer, {
    cors: {
        origin: `http://localhost:3000`
    }
});
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
                socket.on('disconnect', () => {})
            });
        }
        startIo()
    }
    res.send({})
})

app.use('/room', roomRouter)

if (roomID) {
    console.log(roomID);
}


httpServer.listen(3001);