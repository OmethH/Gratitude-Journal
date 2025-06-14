require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // to read JSON from frontend

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", () => console.log("✅ Connected to MongoDB"));
db.on("error", console.error);

// Define Mongoose Schema
const entrySchema = new mongoose.Schema({
  text: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Entry = mongoose.model("Entry", entrySchema);


// Routes
app.get("/entries", async (req, res) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1 }); // newest first
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

app.post("/entries", async (req, res) => {
  const { text } = req.body;
  console.log("📥 Incoming POST /entries with:", text); // 👈

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const entry = new Entry({ text });
    const savedEntry = await entry.save();
    console.log("✅ Entry saved to DB:", savedEntry); // 👈
    res.json(savedEntry);
  } catch (err) {
    console.error("❌ Error saving entry:", err); // 👈
    res.status(500).json({ error: "Failed to save entry" });
  }
});

// DELETE a gratitude entry by ID
app.delete("/entries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Entry.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ error: "Entry not found" });
    }
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error deleting entry" });
  }
});

// PUT (update) a gratitude entry by ID
app.put("/entries/:id", async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const updatedEntry = await Entry.findByIdAndUpdate(
      id,
      { text },
      { new: true } // return the updated document
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json(updatedEntry);
  } catch (err) {
    res.status(500).json({ error: "Failed to update entry" });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
