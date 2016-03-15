'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')

const simpleJsParser = require('./simpleJsParser')

const port = process.env.PORT || 8088

const app = express()
app.use(bodyParser.urlencoded({
  extended: true
}))

const hbs = exphbs.create({

})

const viewsPath = __dirname + '/views/'

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', viewsPath)

app.get('*', (req, res) => {
  res.render('index')
})

app.post('*', (req, res) => {
  const vm = {}
  try {
    const result = simpleJsParser.parse(req.body.data)
    console.log('result:', result)
    if (result.obj) {
      vm.json = JSON.stringify(result.obj, null, '  ')
      vm.report = 'parsed'
    } else {
      vm.json = req.body.data
      vm.report = 'Report:' + result.report
    }
  } catch (ex) {
    vm.json = req.body.data
    vm.report = 'Error: ' + ex
  }
  console.log('vm:', vm)
  res.render('index', vm)
})

app.listen(port, err => {
  if (err) console.error('Could not listen on port ' + port)
  else console.log('I\'m listening, fire your js at port ' + port)
})
