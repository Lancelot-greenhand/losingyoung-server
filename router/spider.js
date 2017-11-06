const express = require('express')
const request = require('request')
const router = express.Router()
const carServerBase = 'http://localhost:3030'

router.get('/get_all_car_data', (req, res) => {
    let url = carServerBase + '/get_all_car_data'
    request({
        url,
        json: true
    }, (err, response, body) => {
        if (err) {
            res.json(err)
            return
        }
        res.json(body)
    })
})


module.exports = router