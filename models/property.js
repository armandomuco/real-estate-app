const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["house", "shop", "land"],
    required: [true, "Type is required."],
  },
  location: {
    country: {
      type: String,
      required: [true, "Country is required."],
    },
    state: String,
    city: {
      type: String,
      required: [true, "City is required."],
    },
    address: {
      type: String,
      required: [true, "Address is required."],
    },
  },
  area: [
    {
      lang: Number,
      lat: Number,
    },
  ],
  name: {
    type: String,
    required: [true, "Name is required."],
    unique: [true, "Name should be unique"],
  },
});

const Property = mongoose.model("properties", propertySchema);

module.exports = Property;
