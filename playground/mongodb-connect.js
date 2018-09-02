const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if(err){
       return console.log('Unable to connect to mongodb server');
    }
    console.log('Connected to mongodb server');
    const db = client.db('TodoApp');

    // db.collection('Todos').insertOne({
    //     text: 'Something to do',
    //     completed: false
    // }, (err, result) => {
    //     if (err){
    //         return console.log('Unable to insert todo', err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });
    db.collection('Users').insertOne({
        name: 'Deadman',
        age: '38',
        location: 'Wonderland'
    }, (err, result) => {
        if (err){
            return console.log('unable to create a user');
        }
        console.log(JSON.stringify(result.ops, undefined, 2));
    });
    client.close();
});