const mongoose = require("mongoose");

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
    db.on("error", (error) => {
        console.log("MongoDB connection error. ERROR : " + error);
    });
    db.on('disconnected', () => {
        console.log("Connection to database is closed.");
    })
};
module.exports = dbconnect;