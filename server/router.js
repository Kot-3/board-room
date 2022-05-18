const db = require('./db')
const express = require('express')
const router = express.Router()
const multer = require('multer');
const storage = multer.diskStorage({
    // 上传文件的目录
    destination: function (req, file, cb) {
        cb(null, 'assets')
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

router.get('/getRecord/:room', async (req, res) => {
    const {
        room
    } = req.params
    const {
        limit = 1000, offset = 0
    } = req.query
    const record = await db.getRecord(room, limit, offset)

    res.json(record)
})
router.post('/file_upload', upload.single('file'), (req, res) => {
    res.send({
        data: req.file
    })
})

module.exports = router