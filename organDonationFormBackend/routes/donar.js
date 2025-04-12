const express = require('express');
const router = express.Router();
const Donar = require('../models/donar');

router.post('/donar', async (req, res) => {
    try {
        const donar = new Donar(req.body);
        await donar.save();
        res.status(201).send({ message: 'Donar registered successfully', donar });
    } catch (error) {
        res.status(400).send({ message: 'Error registering donar', error });
    }
}
);

router.get('/donar', async (req, res) => {
    try {
        const donars = await Donar.find();
        res.status(200).send(donars);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching donars', error });
    }
}
);

router.get('/donar/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const donar = await Donar.findById(id);
        if (!donar) {
            return res.status(404).send({ message: 'Donar not found' });
        }
        res.status(200).send(donar);
    } catch (error) {
        res.status(500).send({ message: 'Error fetching donar', error });
    }
}
);

module.exports = router;