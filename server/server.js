var express = require('express');
var bodyParser = require('body-parser');
var {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/User');

const port = prosess.env.PORT | 3000;
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

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    console.log(id);
    if(!ObjectID.isValid(id)){
        return res.status(404).send('Invalid id');
    }
    Todo.findById(id).then((todo) => {
        if(!todo){
            return res.status(404).send('Not found');
        }
        res.status(200).send(todo);
    }).catch((e) => {
        return res.status(400).send('Todo not found');
    })
})

app.listen(port,() => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};
