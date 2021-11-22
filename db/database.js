
// Database connection
const mongoose = require("mongoose");
const db = "mongodb://localhost/food";

async function connectDB() {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
    });
    console.log("MongoDB is connected");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = connectDB;