var express = require("express");
const { route } = require(".");
var router = express.Router();

const data = [
    {name: "name1", description: "des1"}, 
    {name: "name2", description: "des2"},
    {name: "name3", description: "des3"}, 
    {name: "name4", description: "des4"}];

const data1 = ["name1", "name2", "name3", "name4"];
    
router.get("/", function(req, res, next) {
    res.send(data);
});

module.exports = router;