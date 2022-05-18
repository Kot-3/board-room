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
    msg       VARCHAR (1000) NOT NULL,
    url       VARCHAR (1000) NOT NULL,
    type       VARCHAR (20) NOT NULL
);`)

function getRecord(roomId, limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * from tb_msg WHERE `room` = ? ORDER BY `time` DESC LIMIT ? OFFSET ?', roomId, limit, offset, (err, row) => {
            if (err) reject(err)

            resolve(row)
        })
    })
}

function setRecord(msgItem) {
    const {
        name,
        room,
        uid,
        time,
        msg,
        url,
        type
    } = msgItem
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO tb_msg(\`name\`, \`room\`, \`uid\`, \`time\`, \`type\`, \`msg\`,\`url\`)
            VALUES($name, $room, $uid, $time, $type,  $msg, $url);`, {
            $name: name,
            $room: room,
            $uid: uid,
            $time: time,
            $msg: msg,
            $url: url,
            $type: type
        }, (err, row) => {
            if (err) reject(err)

            resolve(row)
        })
    })
}

module.exports = {
    getRecord,
    setRecord
}