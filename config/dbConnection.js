const mongoose = require("mongoose");

const connectDB = async() => {
	return new Promise ((resolve,reject)=>{
		try
		{
			const db = process.env.MONGO_URI;
			await mongoose.connect(db,{directConnection:true});
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