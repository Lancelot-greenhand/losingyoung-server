const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const sizeOf = require('image-size')
const curPath = path.dirname(__dirname)
const imgDir = path.resolve(curPath, './images/')
const relativeImgPath = path.join('./images')
const config = require('../config/config.js')
const imgTypes = ['.jpg', '.jpeg', '.png', '.gif']
/* TODO
获取文件夹list --分页功能

获取某个文件夹下图片 --分页


流程：
通过数据库获取list名称和cover img
点击list，获取qiniu相应前缀的资源
*/
router.get('/get_image_list', (req, res) => {
    // let pageSize = req.query.pageSize
    // let toPage = req.query.toPage
    let usPath = path.join(relativeImgPath, 'us')
    fs.readdir(usPath, (err, files) => {
        if (err) {
            console.log(err)
            res.json(err)
            return
        }
        let fileList = []
        files.forEach((file, idx) => {
          let dirPath = path.join(usPath, file)
          let stats = fs.statSync(dirPath) 
          if (stats.isDirectory()) {
            let fileItem = {
                listName: file
            }
            let coverImg = 'images/us/2015年6月云南/PIC_20150621_165054_C7A.jpg' //加个默认封面
            imgTypes.every(type => {
              let imgName = `cover${type}`
              let coverPath = path.join(dirPath, imgName)
              if (isExist(coverPath)) {
                coverImg = coverPath
                return false
              }
              return true
            })
            fileItem.coverImg = coverImg
            fileList.push(fileItem)
          }
        })
        res.json(fileList)
    })
})

router.get('/get_image_item', (req, res) => {
    let query = req.query
    let listId = query.listId
    // let queryDir = path.join(imgDir, 'us', listId)
    let queryDir = path.join(relativeImgPath, 'us', listId)
    console.log(queryDir)
    fs.readdir(queryDir, (err, files) => {
        if (err) {
            console.log(err)
            res.json(err)
            return
        }
        let filePathA = []
        files.forEach((fileName) => {
            if (!~imgTypes.indexOf(path.extname(fileName).toLowerCase())) {
              return
            }
            let fpath = path.join(queryDir, fileName)
            let dimensions = sizeOf(fpath)
            let width = dimensions.width
            let height = dimensions.height
            filePathA.push({
                src: fpath,
                width,
                height
            })
        })
        res.send(filePathA)
    })
})

// 上传单个图片 
router.post('/upload', (req, res) => {
    let data = req.body
    let source = data.source
    let userName = data.user_name
    let saveDir = data.img_dir || ''
    let fileName =  userName + '_' + getTimestamp() + '_' + data.name
    let extentName = path.extname(fileName)
    let base64Filename = Buffer.from(fileName).toString('base64') + extentName
    // decode: Buffer.from(base64Filename, 'base64').toString()
    // let finalPathName = imgDir + '/' + base64Filename
    let finalDir = path.join(imgDir, saveDir)
    ensureDir(finalDir)
    let finalPathName = path.join(finalDir, base64Filename)
    let base64Data = source.replace(/^data:image\/\w+;base64,/, '')
    let sourceBuffer = Buffer.from(base64Data, 'base64')
    let imgHref = config.dev_host_name + path.join('images', saveDir, base64Filename)
    fs.writeFile(finalPathName, sourceBuffer, (err) => {
        if (err) {
            res.json({
                result: false
            })
        } else {
            res.json({
                result:true,
                href: imgHref
            })
        }
    })
})

function getTimestamp () {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    let result = '' + year + month + day + hour + minute + second
    return result
}
function ensureDir (dir) {
//   let stats = fs.statSync(dir)
  if (fs.existsSync(dir)) {
    let stats = fs.statSync(dir)
    if (stats && stats.isDirectory()) {
        return
    } else {
        fs.mkdirSync(dir)
    }
  } else {
    fs.mkdirSync(dir)
  }
}
function isExist (path) {
  try {
      fs.statSync(path)
  } catch (e) {
    return false
  }
  return true
}
module.exports = router