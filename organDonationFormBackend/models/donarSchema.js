const mongoose = require("mongoose");

const donarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    bloodGroup: {
        type: String,
        required: true,
    },
    organType: {
        type: String,
        required: true,
    },
});

const Donar = mongoose.model("Donar", donarSchema);
module.exports = Donar;