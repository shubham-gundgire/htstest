const mongoose = require("mongoose");

//  function used to connect to mongodb atlas running database
const dbconnect = async () => {
    await mongoose
        .connect(process.env.MONGOOSEURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log("Succesfuly connected to database.");
        });

    const db = mongoose.connection;

    //when we get error while making connection to mongodb 
    db.on("error", (error) => {
        console.log("MongoDB connection error. ERROR : " + error);
    });

    // when database is disconnected 
    db.on('disconnected', () => {
        console.log("Connection to database is closed.");
    })
};
module.exports = dbconnect;