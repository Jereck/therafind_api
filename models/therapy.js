const mongoose = require('mongoose');

const TherapySchema = new mongoose.Schema({
    name: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String
    }
});

module.exports = mongoose.model("Therapy", TherapySchema);