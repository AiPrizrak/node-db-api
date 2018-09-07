require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const bcrypt = require('bcryptjs');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();

const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
        console.log('Completed');
    }, (e) => {
        res.send(e);
    });
});

app.get('/todos', authenticate, (req, res) => {
    console.log('test get');
    Todo.find({_creator: req.user._id}).then((todos) => {
      res.send({todos});
    }, (e) => {
        res.status(400).send(e);
      })
  });
app.delete('/todos/:id', authenticate, (req,res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send('Invalid id');
    }
    Todo.findOneAndRemove({_id: id, _creator: req.user._id}).then((result) => {
        if(!result){
            return res.status(404).send();
        }
        res.status(200).send({result});
    }).catch((e) => {
        return res.status(400).send();
    });
});
app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send('Invalid id');
    }
    Todo.findOne({_id: id, _creator: req.user._id}).then((todo) => {
        if(!todo){
            return res.status(404).send('Not found');
        }
        res.status(200).send(todo);
    }).catch((e) => {
        return res.status(400).send('Todo not found');
    })
});

app.patch('/todos/:id', authenticate, (req, res) => {
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

    Todo.findOneAndUpdate({_creator: req.user._id, _id: id}, {$set: body}, {new: true}).then((todo) => {
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

app.post('/users/login', (req, res) => {

    User.findByCredentials(req.body.email, req.body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
        
    }).catch((e) => {
        res.status(400).send();
    });
    // var email = req.body.email;
    // var password = req.body.password;

    // User.findOne({email, password}).then((user) => {
    //     if(!user){
    //         return res.status(400).send();
    //     }
    //     bcrypt.compare(password, user.password, (err, res) => {
    //         // if(err){
    //         //     return res.status(400).send();
    //         // } 
    //         user.generateAuthToken().then((token) => {
    //         res.header('x-auth', token).send(user);
    //         }).catch((e) => {
    //         res.status(400).send(e);
    //     });
        
    //     });

    // });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    
    console.log(req.header('x-auth'));
    req.user.removeToken(req.token).then(() => {
        console.log(req.token);
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.listen(port,() => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};
