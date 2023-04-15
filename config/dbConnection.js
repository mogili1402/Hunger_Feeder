const mongoose = require("mongoose");

const connectDB = async() => {
	return new Promise (async (resolve,reject)=>{
		try
		{
			const db = process.env.MONGO_URI;
			await mongoose.connect(db);
			console.log("MongoDB connected...");
			resolve()
		}
		catch(err)
		{
			console.log(err);
			reject()
		}
	})
}

module.exports = connectDB;