
const express = require("express");
const router = express.Router();

const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcryptjs');


require('express-async-errors');

router.post("/signin", function (req, res, next) {
    passport.authenticate('local', {session: false}, (err, user, info) => {
        if (err || !user || user === undefined || user.length == 0) {
            return res.status(400).json({
                message: info.message,
                user   : user
            });
        }
       req.login(user, {session: false}, (err) => {
           if (err) {
               res.send(err);
           }
           // generate a signed son web token with the contents of user object and return it in the response
           const token = jwt.sign(JSON.stringify(user), 'your_jwt_secret');
           return res.json({user, token});
        });
    })(req, res);
});

router.post("/signup", function (req, res, next) {
    passport.authenticate('local-signup', {session: false}, (err, user, info) => {
        if (err || !user || user === undefined || user.length == 0) {
            return res.status(400).json({
                message: info.message,
                user   : user
            });
        }
       req.login(user, {session: false}, (err) => {
           if (err) {
               res.send(err);
           }
           // generate a signed son web token with the contents of user object and return it in the response
           const token = jwt.sign(JSON.stringify(user), 'your_jwt_secret');
           return res.json({user, token});
        });
    })(req, res);
});

module.exports = router;
