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
    setRecord,
    getLastRecord
} =
require('./db')
const app = express();
app.use(cors())
const roomRouter = require('./router')
const httpServer = createServer(app);

app.use(express.static(path.join(__dirname, 'assets')))
const io = new Server(httpServer, {
    cors: {
        origin: true // 前端端口
    }
});

var startIo = ''
var roomID = ''
app.get('/room/recordroom', cors(), (req, res) => {
    roomID = req.query[0]
    if (startIo == '') {
        startIo = function () {
            io.on("connection", (socket) => {

                socket.join(roomID)
                socket.on("message", async (msg) => {
                    const res = await getLastRecord()
                    msg.id = Number(res[0].id) + 1
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



httpServer.listen(10001); //服务器端口