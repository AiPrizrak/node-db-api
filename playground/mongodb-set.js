const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) =>{
    if (err){
        return console.log('Something wrong with connection toserver');
    }
    client.collection('Users')
    .findOneAndUpdate({_id: new ObjectID('5b8bdab0df700cfd5a9f6c8b')},{$inc: {age: 3}});
    client.close();
});