require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const Property = require("./models/property");
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect("mongodb://127.0.0.1:27017/real-estate", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error(err));

function validateProperty(req, res, next) {
  const { type, location, area, name } = req.body;

  if (!type || !location || !area || !name) {
    return res
      .status(400)
      .json({ error: "All required fields must be provided" });
  }

  const { country, city, address } = location;
  if (!country || !city || !address) {
    return res.status(400).json({ error: "Location details are incomplete" });
  }

  if (area.length < 5 || area.length > 5) {
    return res
      .status(400)
      .json({ error: "The area should have only five ponts!" });
  }

  if (!["house", "shop", "land"].includes(type)) {
    return res.status(400).json({ error: "Invalid value for 'type'" });
  }

  next();
}

app.get("/property", async (req, res) => {
  try {
    const properties = await Property.find();
    if (properties.length === 0) {
      return res.json({ message: "No property in the database" });
    }
    res.status(200).json({
      message: "Properties gets successfully!",
      length: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/property/:id", async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id });
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    return res
      .status(200)
      .json({ message: "Property gets successfully!", property });
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed ")) {
      return res.status(404).json({ error: "No property found with that id!" });
    }
    res.status(500).json({ error: error });
  }
});

app.post("/property", validateProperty, cors(), async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    await newProperty.save();
    res
      .status(201)
      .json({ message: "Property added successfully", newProperty });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(400).json({ error: "Property name must be unique!" });
    }
    res.status(500).json({ error: error.message });
  }
});

app.put("/property/:id", validateProperty, async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    res
      .status(200)
      .json({ message: "Property edited successfully!", property });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      return res.status(400).json({ error: "Property name must be unique!" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/property/:id", async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id });
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.status(200).json("Property deleted succsefully");
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed ")) {
      return res.status(404).json({ error: "No property found with that id!" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function calculateArea(points) {
  const n = points.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].lat * points[j].lang - points[j].lat * points[i].lang;
  }
  area = Math.round(Math.abs(area)) / 2;
  return area;
}

app.get("/property/:id/area", async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id });
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    const area = calculateArea(property.area);
    res.status(200).json({ area });
  } catch (error) {
    if (error.message.includes("Cast to ObjectId failed ")) {
      return res.status(404).json({ error: "No property found with that id!" });
    }
    res.status(500).json({ error: error });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`APP IS LISTENING ON PORT ${PORT}!`);
});
