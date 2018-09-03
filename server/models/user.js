var mongoose = require('mongoose');

var User = mongoose.model('Users', {
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5
    }
});

module.exports = {User};