var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
//mongoose.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true});
module.exports = {mongoose};