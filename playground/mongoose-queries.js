const {mongoose} = require('./../server/db/mongoose');
const {ObjectID} = require('mongodb');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// var id = '8b8e3dd87e2db5017c9705b8';

// if (!ObjectID.isValid(id)){
//     console.log('ID is not valid');
// }
// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos',todos);
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     if(!todo){
//         return console.log('There is no object with given ID');
//     }
//     console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {
//     if (!todo){
//         return console.log('There is no object with given ID');
//     }
//     console.log('Todo By ID', todo);
// }).catch((e) => console.log(e));

var id = '7b8ce59c1a040f6870c7b8aa';

if(!ObjectID.isValid(id)){
    console.log('ID is not valid');
}

User.findById(id).then((user) => {
    if(!user){
        return console.log('Cannot find user with this id');
    }
    console.log('User', user);
}).catch((e) => console.log(e));