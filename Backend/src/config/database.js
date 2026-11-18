const mongoose = require("mongoose");

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
        });
        console.log("Connected to MongoDB Database successfully");
    } catch (err) {
        console.error("CRITICAL: Failed to connect to MongoDB Database:", err.message);
    }
}

module.exports = connectToDB;