const { Schema, model, Types: { ObjectId } } = require('mongoose');

const URL_PATTERN = /^https?:\/\/(.+)/;


// TODO add validation
const petSchema = new Schema({
    name: { type: String, required: [true, 'Name is required'], minlength: [2, 'Name must be at least 2 characters long'] },
    image: {
        type: String, required: true, validate: {
            validator(value) {
                return URL_PATTERN.test(value);
            },
            message: 'Image must be a valid URL'
        }
    },
    age: { type: Number, required: true, min: 1, max: 100, default: 1},
    description: { type: String, required: [true, 'Description is required'], minlength: [5, 'Description must be at least 5 characters long'], maxlength: [50, 'Description must be at most 50 characters long']},
    location: { type: String, required: [true, 'location is required'], minlength: [5, 'Location must be at least 5 characters long'], maxlength: [50, 'Location must be at most 50 characters long'] },
    comments: [
                    { 
                        user: {type: ObjectId, required: true, ref: 'User'}, 
                        message: {type: String, required: [true, 'Comment message is required']} 
                    }
                ],
    owner: { type: ObjectId, ref: 'User', required: true }
});


const PetModel = model('Pet', petSchema);

module.exports = PetModel;