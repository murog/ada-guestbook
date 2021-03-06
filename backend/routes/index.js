const express = require('express');

const bodyParser = require('body-parser');
const Message = require('./messages')
const Stickers = require('./stickers')
const pgClient = require("./connection")

const router = express.Router();
router.use(bodyParser.json());

// Handles GET requests to /messages
router.get('/messages', async (req, res) => {
    console.log(`received request: ${req.method} ${req.url}`)

    // Query for messages in descending order
    try {
        const msg = await Message.retrieve(pgClient);
        res.status(200).json(msg);
    } catch (error) {
        res.status(500).json(error.error);
    }
});

// Handles POST requests to /messages
router.post('/messages', async (req, res) => {
    console.log(`received request: ${req.method} ${req.url}`)

    // fail if request body is empty
    if (!req.body){
        return res.status(400).json("Bad Request");
    }

    // Save message to database
    try {
        const msg = {
            name: req.body.name,
            body: req.body.body,
            sticker: req.body.stickerUrl
        }
        await Message.create(msg, pgClient);
        res.status(200).json(msg);
    } catch (err) {
        if (err.routine == "ExecConstraints") {
            console.error('validation error: ' + err);
            res.status(400).json(err);
        } else {
            console.error('could not save: ' + err);
            res.status(500).json(err);
        }
    }
});

// Handles GET requests to /stickers
router.get('/stickers', async (req, res) => {
    console.log(`received request: ${req.method} ${req.url}`)

    // get collection of stickers from storage bucket
    try {
        const stickers = await Stickers.retrieve();
        res.status(200).json(stickers);
    } catch (error) {
        res.status(500).json(error.error);
    }
});
module.exports = router;
