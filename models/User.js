const mongoose = require("mongoose");
const snowflake = require("@theinternetfolks/snowflake").Snowflake

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: snowflake.generate, // Use snowflake.generate as the default value for the id field
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
});
module.exports = mongoose.model("User", userSchema);

// export default mongoose.model("User", userSchema);
