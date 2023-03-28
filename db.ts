import mongoose from "mongoose";

const MongoURI = "mongodb://localhost:27017/test";

const connectToMongo = async (): Promise<void> => {
  try {
    await mongoose.connect(MongoURI);
    console.log("Connected to MongoDB Atlas");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas", error);
  }
};

export default connectToMongo;
