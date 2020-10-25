const express = require("express");
require('express-async-errors');

const router = express.Router();
const model = require('../utils/sql_command');

router.get("/", async(req, res) => {

    const [data] = await Promise.all([
        model.getAllBoard(),
    ]);
    console.log(data);
    res.send(data);
});

module.exports = router;