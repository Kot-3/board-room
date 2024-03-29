import axios from 'axios'
const request = axios.create({
    withCredentials: true, // 当跨域请求时发送cookie
    timeout: 50000, // 请求超时时间
    baseURL: `/room`,
})
export function recordRoom(id) {
    return request({
        url: `/recordroom`,
        method: 'get',
        params: id
    })
}
export function getRecordList(data) {
    return request({
        url: `/getRecord`,
        method: 'get',
        params: data
    })
}
export function fileUpload(data) {
    return request({
        // contentType: false,
        // processData: false,
        url: `/file_upload`,
        method: 'post',
        data
    })
}
export function deleteMessage(id) {
    return request({
        url: `/deleteMessage?id=${id}`,
        method: 'get',

    })
}
export function getFileList(room) {
    return request({
        url: `/getFileList?room=${room}`,
        method: 'get',

    })
}