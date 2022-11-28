const db = require('./db')
const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path')
const storage = multer.diskStorage({
    // 上传文件的目录
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'assets'))
    },
    // 上传文件的名称
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
// multer 配置
const upload = multer({
    storage
})

router.get('/getRecord', async (req, res) => {
    // const {
    //     room
    // } = req.params
    // const {
    //     limit = 20, page = 0
    // } = req.query
    const {
        room,
        limit = 20,
        page = 1
    } = req.query
    const record = await db.getRecord(room, limit, page)

    res.json(record)
})
router.get('/deleteMessage', async (req, res) => {

    const record = await db.delMsg(req.query.id)
    res.json(record)
})
router.get('/getFileList', async (req, res) => {
    const {
        room
    } = req.query
    const record = await db.getFileList(room)
    res.json(record)

})
router.post('/file_upload', upload.single('file'), (req, res) => {
    res.send({
        data: req.file,
        file: path.join(__dirname, '../file')
    })
})

module.exports = router