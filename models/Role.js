const mongoose = require('mongoose');
const snowflake = require("@theinternetfolks/snowflake").Snowflake

const roleSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
        default: snowflake.generate, // Use snowflake.generate as the default value for the id field
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  });
module.exports = mongoose.model("Role", roleSchema);

  