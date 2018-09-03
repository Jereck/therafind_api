var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    therapy: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Therapy'
            },
            name: String,
            address: String,
            city: String,
            state: String,
            zip: String
        }
    ]
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);