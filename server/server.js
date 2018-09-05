require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT;

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
app.delete('/todos/:id', (req,res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send('Invalid id');
    }
    Todo.findByIdAndDelete(id).then((result) => {
        if(!result){
            return res.status(404).send();
        }
        res.status(200).send({result});
    }).catch((e) => {
        return res.status(400).send();
    });
});
app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
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
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.post('/users', (req, res) => {
    var registerData = _.pick(req.body, ['email', 'password']);
    var newUser = new User(registerData);

    newUser.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    });
    
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.listen(port,() => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};
