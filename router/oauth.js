const express = require('express')
const router = express.Router()
const { PORT, OAuthConfig } = require('../config/config')
const { getMyIp } = require('../utils/tools')
const https = require('https')

const users = {}
router.get('/redirect_github', (req, res) => {
    // res.end('bye')
    const ip = getMyIp()
    const backUrl = req.query.callback
    if (!backUrl) {
        res.writeHead(404)
        res.end('404')
    }
    var dataStr = (new Date()).valueOf() + parseInt(Math.random() * 1000);
    users[dataStr] = {backUrl}
    let path = 'https://github.com/login/oauth/authorize'
    path += '?client_id=' + OAuthConfig.GITHUB_CLIENT_ID
    path += '&state=' + dataStr
    // path +='&redirect_uri=' + 'http' + ip + ':' + PORT + '/api/oauth/github_callback2'
    res.redirect(path)
})
router.get('/github_callback', (req, res) => {
    // res.end('bye')
    const code = req.query.code
    // 判断state是否一个人
    const state = req.query.state
    if (!(state in users)) {
        res.json({
            errMsg: ' cuowu'
        })
        return
    }

    const post_data = {
        client_id: OAuthConfig.GITHUB_CLIENT_ID,
        client_secret: OAuthConfig.GITHUB_CLIENT_SECRET,
        code
    }
    const reqdata = JSON.stringify(post_data);

    let path = '/login/oauth/access_token'

    let headers = {}
    headers["Content-Type"] = 'application/json'
    headers['Content-Length'] = reqdata.length
    headers["Accept"] = 'application/json'
    const opts = {
        method: 'POST',
        hostname: 'github.com',
        path,
        headers
    }
    let re = https.request(opts, (response) => {
        response.setEncoding('utf-8')
        // console.log(res)
        response.on('data', (data) => {
            let obj = JSON.parse(data)
            let access_token = obj.access_token
            if (!access_token) {
                re.end()
            }
            // let url = `https://api.github.com/user?access_token=${access_token}`
            let headers = {
                'user-agent': 'curl/7.55.1'
            }
            headers["accept"] = '*/*'
            // headers.host = 'api.github.com'
            let aopts = {
                headers,
                Host: 'api.github.com',
                hostname: 'api.github.com',
                path: `/user?access_token=${access_token}`
            }
           let re =  https.get(aopts, (resa) => {
                resa.setEncoding('utf-8')
                let rawData = ''
                resa.on('data', (data) => {
                    rawData +=data
                }).on('end', () => {
                    try {
                        let userInfo = JSON.parse(rawData)
                        users[state].userInfo = userInfo
                        res.redirect(users[state].backUrl + '?github_login=' + state)
                    } catch (error) {
                        res.redirect(users[state].backUrl + '?github_login=' + 0)
                    }
                })
            })
            re.on('error', (e) => {
                console.log('err', e)
            })
        })
    })
    re.write(reqdata)
    re.on('error', (e) => {
        console.log('chucuole', e)
        res.redirect('http://127.0.0.1:8080')
    })
})
router.get('/get_github_info', (req, res) => {
    let state = req.query.state
    if (state && state in users) {
        res.json(users[state].userInfo)
        delete users[state]
    } else {
        res.json({
            errorMsg: 'mei you'
        })
    }
})

module.exports = router