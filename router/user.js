const uuidV1 = require('uuid/v1')
const EventProxy = require('eventproxy');
const express = require('express')
const md5 = require('blueimp-md5')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const User = require('../models/user/user.js')
const UserLoginValidate = require('../models/user_login_validate/user_login_validate.js')
const insertUser = require('../models/user/insert.js')
const InputValidation = require('../utils/InputValidation.js')
const router = express.Router()
const loginCookieExpires = 2592000000 // 一个月1000*60*60*24*30 = 2592000000

router.post('/insert', (req, res) => {
    let data = req.body
    insertUser(req.body).then(function (data) {
        let msg = JSON.stringify(data)
        res.json({
            result: 'success'
        })
    }).catch(err => {
        res.json({
            result: 'fail',
            err
        })
    })
})
router.get('/get_user_info', (req, res) => {
  let cookies = req.cookies
  res.json({'ss':'yes'})
})

router.get('/check_account_unused/:account', (req, res) => {
    let account = req.params.account
    User.findOne({
        account: account
    }).then(result => {
        if (result === null) {
            res.json({
                result: true
            })
        } else {
            res.json({
                result: false
            })
        }
    }).catch(err => {
        res.json(err)
    })
})
router.get('/check_user_name_unused/:user_name', (req, res) => {
    let user_name = req.params.user_name
    User.findOne({
        user_name
    }).then(result => {
        if (result === null) {
            res.json({
                result: true
            })
        } else {
            res.json({
                result: false
            })
        }
    }).catch(err => {
        res.json(err)
    })
})
// 自动登录， 检查登陆状态
router.post('/auto_login', (req, res) => {
  var data = req.body,
      browserId = data.b_id,
      cookies = req.cookies,
      account;
    if (!browserId) {
        res.json({
          result: false
        })
        return
    }
    if (cookies.account && cookies.login_token) {
        account = cookies.account
      UserLoginValidate.findOne({
        account
    }).then(result => {
        if (result === null || result.login_token !== cookies.login_token || result.b_id !== browserId) {
            res.json({
                result: false
            })
            return
        }
        let newToken = generateToken()
        let cookieOp = {
            maxAge: loginCookieExpires,
            httpOnly: true
        }
        res.cookie('login_token', newToken, cookieOp)
        var evt = EventProxy.create('update_login_token', 'query_user_info', function(token, user_info){
            res.json({
                result: true,
                user_info
            })
        })
        // 更新 user_login_validate 表数据
        UserLoginValidate.update({
            account
        }, {
            login_token: newToken
        }, function(err){
          evt.emit('update_login_token')
        })
        // 查找用户信息
        User.findOne({
            account
        }, '-account -pwd').then(result => {
          evt.emit('query_user_info', result)
        })
    })
    } else {
      res.json({
        result: false
      })
    }
      
})

// 账号密码登录验证
router.post('/login_validate_user', (req, res) => {
    var data = req.body,
        account = data.account,
        pwd = data.pwd,
        b_id = data.b_id
    User.findOne({
        account: account
    }).then(result => {
        if (result === null) {
            res.json({
                result: '账号或密码错误'
            })
        }
        bcrypt.compare(pwd, result.pwd, function(err, correct) {
            // res == true
            if (!correct) {
                res.json({
                    result: '账号或密码错误'
                })
            } else {
                let token = generateToken()
                let cookieOp = {
                    maxAge: loginCookieExpires,
                    httpOnly: true
                }
                res.cookie('login_token', token, cookieOp)
                res.cookie('account', account, cookieOp);
                // ({pwd, ...user_info} = result.toJSON()) // interesting
                var user_info = {};
                Object.keys(result.toJSON()).map(key => {
                    if (key !== 'pwd') {
                      user_info[key] = result[key]
                    }            
                })
                // UserLoginValidate 表更新或插入, 读取登陆状态
                UserLoginValidate.update({
                    account
                }, {
                    account,
                    b_id,
                    login_token: token
                }, {
                    upsert: true
                }, function() {
                    res.json({
                        result: true,
                        user_info
                    })
                })

            }

        });

    }).catch(err => {
        res.json(err)
    })
}) 
router.post('/register_new_user', (req, res) => {
    var data = req.body,
        account = data.account,
        user_name = data.userName,
        pwd = data.pwd, // 浏览器md5加密后的，下面bcrpt再加一次
        b_id = data.b_id
    let validate_data = {
        account,
        user_name,
        pwd
    }
    // 配置验证响应后操作
    var exist_validation = EventProxy.create('unusedAccount', 'unusedUserName', function (unusedAccount, unusedUserName) {
        if (!unusedAccount) {
            res.json({
                result: '账号已被占用, 请重新输入'
            })
            return
        }
        if (!unusedUserName) {
            res.json({
                result: '用户名已被占用, 请重新输入'
            })
            return
        }
        // 密码加密
        bcrypt.hash(pwd, saltRounds, function(err, hash) {
           // Store hash in your password DB.
           if (err) {
               console.log('bcrypt err', err)
               return
           }
           validate_data.pwd = hash
            insertUser(validate_data).then(function (data) {
                let account = data.account
                var user_info = {};
                Object.keys(data).map(key => {
                    if (key !== 'pwd') {
                      user_info[key] = data[key]
                    }            
                })
                let token = generateToken()
                let cookieOp = {
                    maxAge: loginCookieExpires,
                    httpOnly: true
                }
                res.cookie('login_token', token, cookieOp)
                res.cookie('account', account, cookieOp);
                UserLoginValidate.create({
                    account,
                    b_id,
                    login_token: token
                }, (err) => {
                    if (err) {
                        res.json({
                          result: false
                        })
                        return
                    }
                    res.json({
                        result: true,
                        user_info
                    })                   
                })
            }).catch(err => {
                res.json({
                    result: false,
                    err
                })
            })
        });

    })
    //验证注册信息
    let can_register = validateNewUser(validate_data, exist_validation, req, res)
})
function validateNewUser(inputs, exist_validation, req, res) {
    let account = inputs.account
    let user_name = inputs.user_name
    let pwd = inputs.pwd
    let validate_ops = [{
        value: account,
        method: validateAccount
    }, {
        value: user_name,
        method: validateUserName
    }, {
        value: pwd,
        method: validatePwd
    }]

    let input_validation = new InputValidation(validate_ops)
    let is_valid = input_validation.validate()
    if (is_valid !== true) {
        res.json(if_valid)
        return false
    }
    User.findOne({
        account
    }).then(result => {
        let isUnused = false
        if (result === null) {
            isUnused = true
        }
        exist_validation.emit('unusedAccount', isUnused)
    }).catch(err => {
        console.log(err)
    })
    User.findOne({
        user_name
    }).then(result => {
        let isUnused = false
        if (result === null) {
            isUnused = true
        }
        exist_validation.emit('unusedUserName', isUnused)
    }).catch(err => {
        console.log(err)
    })
}
function generateToken() {
    let dateStr = (new Date()).toDateString()
    let ramdonStr = uuidV1()
    let newToken = md5(ramdonStr, dateStr)
    return newToken
}
function validateAccount(account) {
    return {
        result: true
    }
}
function validateUserName(userName) {
    return {
        result: true
    }
}
function validatePwd(pwd) {
    return {
        result: true
    }
}
module.exports = router
