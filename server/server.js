var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/User');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
        console.log('Completed');
    }, (e) => {
        res.send(e);
    });
});

app.get('/todos', (req, res) => {
    console.log('test get');
    Todo.find().then((todos) => {
      res.send({todos});
    }, (e) => {
        res.status(400).send(e);
      })
  });

app.listen(3001,() => {
    console.log('Started on port 3001');
});

module.exports = {app};