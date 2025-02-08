const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ MONGO_URI is not defined");
    return;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB Connected...");
  } catch (err) {
    console.error("❌ Database Connection Failed:", err.message);

    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
