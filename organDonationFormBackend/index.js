const express = require('express');
const { connectDB } = require('./connection');

const donarRoutes = require('./routes/donar');

const app = express();
const PORT = 8000;

connectDB('mongodb://localhost:27017/organDonationDB');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', donarRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
