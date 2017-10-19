const Article = require('../models/article/article.js')
const express = require('express')
const router = express.Router()

router.get('/get_article_list', (req, res) => {
    let category = req.query.category || ''
  Article.find({category}, null, {sort: {'created_date': -1}}, (err, result) => {
      if (err) {
          res.json(err)
          return
      }
      res.json({
          items: result
      })

  })
})
router.get('/get_artcile_item', (req, res) => {
  let id = req.query.id
  Article.findOne({
      id
  }).then(result => {
      if (!result) {
          res.json({
              result: false
          })
          return
      }
      res.json({
          result: true,
          item: result
      })
  })
})

router.post('/add_article', (req, res) => {
    let data = req.body
    data.created_date = new Date()
    Article.create(data, (err) => {
        if (!err) {
            res.json({
                result: true
            })
            return
        }
        res.json({
            result: false
        })
    })
})

router.post('/update_article', (req, res) => {
    let data = req.body
    let id = data.id
    Article.update({
        id
    }, data, (err) => {
        if (!err) {
            res.json({
                result: true
            })
            return
        }
        res.json({
            result: false
        })
    })
})
module.exports = router
