const mongoose = require('mongoose');

const conversationsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },


    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

const Conversations = mongoose.model('Conversations', conversationsSchema);

module.exports = Conversations;
