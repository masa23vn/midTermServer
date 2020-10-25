const db = require("../utils/database");

module.exports = {
    getAllBoard: () =>
        db.load(`SELECT *
                FROM board`),
};