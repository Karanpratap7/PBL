const mongoose = require('mongoose');

async function connectDB(url) {
    return mongoose.connect(url)
        .then(() => {
        console.log("MongoDB Connected");
        }
        ).catch((err) => {
            console.log("MongoDB Connection Failed");
            console.log(err);
        });
};

module.exports = {
    connectDB,
};