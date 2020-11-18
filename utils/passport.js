const passport = require('passport')
const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;
require('express-async-errors');
const bcrypt = require('bcrypt');

const JWTStrategy = passportJWT.Strategy;
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const model = require('./sql_command');

passport.use(new LocalStrategy(
    async (username, password, done) => {
        const user = await model.getUserByUsername(username);
        if (user && user !== undefined && user.length != 0) {
            const res = bcrypt.compareSync(password, user[0].password);
            if (res) {
                return done(null, user, { message: 'Logged In Successfully' });
            }
        }
        return done(null, false, { message: 'Incorrect username or password.' });

    })
);

passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
},
    async (req, username, password, done) => {
        const email = req.body.email;
        const fullname = req.body.fullname;
        const user = await model.getUserByNameOrEmail({ username, email })
        if (user && user !== undefined && user.length != 0) {
            return done(null, false, { message: 'That email or username is already taken.' });
        }
        const hash = bcrypt.hashSync(password, 10);
        await model.register([username, hash, email, fullname]);
        const newUser = await model.getUserByEmail(email);

        return done(null, newUser);

    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret',
    passReqToCallback: true
},
    async (req, jwtPayload, done) => {
        const input = req.body;
        user = await model.getUserByID(jwtPayload[0].ID)
        if (user) {
            const entity = { user, input };                    //entity[0]: user, entity[1]: input
            return done(null, entity);
        }
    }
));

/*
passport.use(new FacebookStrategy({
    clientID: "277390883700241",
    clientSecret: "844a3603b0e8afbf495b3833978dd83e",
    callbackURL: "http://localhost:9000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email'],
    passReqToCallback: true,  
  },
  async (req, accessToken, refreshToken, profile, done) => {
    console.log(profile.emails);  
    
    const username = profile.username;
    const email = profile.email;
    const fullname = profile.fullname;
    const user = await model.getUserByNameOrEmail({ username: username, email: email })
    if (user && user !== undefined && user.length != 0) {
        return done(null, false, { message: 'That email or username is already taken.' });
    }
    await model.register([username, accessToken + "/" + refreshToken, email, fullname]);
    const newUser = await model.getUserByEmail(email);
    
    return done(null, profile);
  }
));
*/