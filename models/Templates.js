const mongoose = require('mongoose');

const templatesSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    template_name: {
        type: String,
        required: true,
        trim: true
    },
    main_features: {
        type: String,
        required: true,
        trim: true

    },
    unique_selling_points: {
        type: String,
        required: true,
        trim: true
    },

    pricing_model: {
        type: String,
        required: true,
        trim: true
    },
    distrubition_channels: {
        type: String,
        required: true,
        trim: true
    },

    gpt_template_summary: {
        type: String,
        required: true,
        trim: true
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

const Templates = mongoose.model('Templates', templatesSchema);

module.exports = Templates;
