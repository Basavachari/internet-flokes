const mongoose = require('mongoose');
const snowflake = require("@theinternetfolks/snowflake").Snowflake

const memberSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
        default: snowflake.generate, // Use snowflake.generate as the default value for the id field
    },
    community: {
        type: String,
        ref: 'Community',
        required: true
    },
    user: {
        type : String,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        ref: 'Role',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Member", memberSchema);
