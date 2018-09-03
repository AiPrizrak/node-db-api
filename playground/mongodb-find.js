const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if(err){
       return console.log('Unable to connect to mongodb server');
    }
    console.log('Connected to mongodb server');
    
client.collection('Todos')
    .find({_id: new ObjectID('5b8bb1c0697aa5265c535778')})
    .toArray()
    .then((docs) => {
        console.log('Todos');
        console.log(JSON.stringify(docs, undefined, 2));
}, (err) => {
    console.log('Unable to fetch todos', err);
        });
        
// client.collection('Users')
// .find({name: 'Andrew'})
// .count()
// .then((count) => console.log(`Todos Andrews count: ${count}`)
// , (err) => console.log('Unable to count Andrews'));
// client.collection('Users').deleteMany({name: 'Deadman'}, (err, obj) => {
//     if (err){
//         return console.log('Could not delete from database');
//     }
//     console.log(obj);
// });
client.collection('Users').findAndDelete({name: 'Andrew'}, (err, obj) => {
    if (err){
        return console.log('cannot delete query');
    }
    console.log(obj.result);
});
client.close();
});