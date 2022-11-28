'use strict'

const path = require('path')
const sqlite3 = require('sqlite3')

const db = new sqlite3.Database(path.resolve(__dirname, '../msg.db'))

db.run(`CREATE TABLE IF NOT EXISTS tb_msg (
    id        INTEGER        PRIMARY KEY AUTOINCREMENT
                              NOT NULL
                              UNIQUE,
    name      VARCHAR (32)   NOT NULL,
    room      VARCHAR (32)   NOT NULL,
    uid       VARCHAR (20)    NOT NULL,
    time      INT (10)       NOT NULL,
    msg       VARCHAR (10000) NOT NULL,
    url       VARCHAR (1000) NOT NULL,
    type       VARCHAR (20) NOT NULL,
    show       VARCHAR (20) NOT NULL
);`)

// function getRecord(roomId, limit = 100, offset = 0) {
//     return new Promise((resolve, reject) => {
//         db.all('SELECT * from tb_msg WHERE `room` = ? ORDER BY `time` ASC LIMIT ? OFFSET ?', roomId, limit, offset, (err, row) => {
//             if (err) reject(err)

//             resolve(row)
//         })
//     })
// }
function getRecord(roomId, limit = 20, page = 1) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM tb_msg WHERE room = ?  AND type in ('image','message')  order by id desc LIMIT (? * ?), ?`, roomId, page - 1, limit, limit, (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    }).catch()
}

function setRecord(msgItem) {
    const {
        name,
        room,
        uid,
        time,
        msg,
        url,
        type,
        show,
    } = msgItem
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO tb_msg(\`name\`, \`room\`, \`uid\`, \`time\`, \`type\`, \`msg\`,\`url\`,\`show\`)
            VALUES($name, $room, $uid, $time, $type,  $msg, $url, $show);`, {
            $name: name,
            $room: room,
            $uid: uid,
            $time: time,
            $msg: msg,
            $url: url,
            $type: type,
            $show: show
        }, (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    }).catch(err => {
        console.log(err);
    })
}

function getFileList(roomId) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT *  FROM tb_msg WHERE room = ? AND type in ('file')`, roomId, (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    }).catch()
}

function getLastRecord() {
    return new Promise((resolve, reject) => {
        db.all(`select * from tb_msg order by id desc limit 0,1`, (err, row) => {
            if (err) reject(err)
            resolve(row)
        })
    })
}

function delMsg(id) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM tb_msg WHERE id=${id}`, (err, row) => {
            if (err) reject(err)

            resolve(row)
        })
    })
}

module.exports = {
    getRecord,
    setRecord,
    delMsg,
    getLastRecord,
    getFileList
}