const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const userRouter = require('./router/user.js')
const articleRouter = require('./router/article.js')
const imageRouter = require('./router/image.js')
const spiderRouter = require('./router/spider.js')
const oauthRouter = require('./router/oauth.js')
const app = express()
const InputValidation = require('./utils/InputValidation.js')
const port = 3000

app.use(express.static(path.join(__dirname, '/dist')))
app.use(express.static(path.join(__dirname)))
app.use(bodyParser.json({limit: '10mb'}))
app.use(bodyParser.urlencoded({extended: true, limit: '10mb'}))
app.use(cookieParser())
app.use('/api/user', userRouter)
app.use('/api/article', articleRouter)
app.use('/api/image', imageRouter)
app.use('/api/spider', spiderRouter)
app.use('/api/oauth', oauthRouter)



app.listen(port)
console.log(`server is running at ${port}`)