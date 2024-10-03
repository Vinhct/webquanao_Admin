import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDB = async (): Promise<void> => {
    mongoose.set("strictQuery", true)
  
    if (isConnected) {
      console.log("MongoDB đã được kết nối.");
      return;
    }
  
    try {
      await mongoose.connect(process.env.MONGODB_URL || "", {
        dbName: "Borcelle_Admin"
      })
  
      isConnected = true;
      console.log("MongoDB đã được kết nối.");
    } catch (err) {
      console.log(err)
    }
  }