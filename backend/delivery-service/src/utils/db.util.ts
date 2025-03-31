import mongoose from "mongoose";
const connectToDatabase = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("MongoDB URI is not defined in the environment variables.");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
};

export default connectToDatabase;
