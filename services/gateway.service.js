// services/gateway.service.js

const ApiGateway = require("moleculer-web");
const express = require("express");
const session = require("express-session");
const passport = require("passport");

module.exports = {
    name: "gateway",
    mixins: [ApiGateway],

    settings: {
        port: 3000,
        routes: [
            {
                path: "/auth",
                use: [
                    (req, res, next) => {
                        req.broker = this.broker;
                        next();
                    },
                    // Add the express-session middleware
                    session({
                        secret:process.env.SESSION_SECRET,  // Replace with your secret key
                        resave: false,
                        saveUninitialized: false,
                        cookie: { secure: false }  // Set to true if using HTTPS in production
                    }),
                    // Initialize Passport and session
                    passport.initialize(),
                    passport.session()
                ],
                aliases: {
                    "POST /register": "auth.register",
                    "POST /login": "auth.login",
                    "GET /google": "auth.googleAuth",
                    "GET /google/callback": "auth.googleCallback",
                    "GET /logout":"auth.logout",
                    "GET /isAuthenticated":"auth.isAuthenticated"
                },
                mappingPolicy: "all",
                onBeforeCall(ctx, route, req, res) {
                    // Attach `req` and `res` to `ctx.meta`
                    ctx.meta.$req = req;
                    ctx.meta.$res = res;
                }
            },
            {
                path: "/api",
                use: [
                    (req, res, next) => {
                        req.broker = this.broker;
                        next();
                    },
                    // Add the express-session middleware
                    session({
                        secret:process.env.SESSION_SECRET,  // Replace with your secret key
                        resave: false,
                        saveUninitialized: false,
                        cookie: { secure: false }  // Set to true if using HTTPS in production
                    }),
                    // Initialize Passport and session
                    passport.initialize(),
                    passport.session()
                ],
                aliases: {
                    "GET /advisor/forecast": "advisor.forecast"                    
                },
                mappingPolicy: "all",
                onBeforeCall(ctx, route, req, res) {
                    // Attach `req` and `res` to `ctx.meta`
                    ctx.meta.$req = req;
                    ctx.meta.$res = res;
                }
            }
        ],
        assets: {
            folder: "public"
        }
    },

    started() {
        const app = express();

        // Express-session configuration
        app.use(session({
            secret: process.env.SESSION_SECRET, // Replace with your secret key
            resave: false,
            saveUninitialized: false,
            cookie: { 
                secure: false,  
                httpOnly: true, 
                sameSite: 'lax' 
            } 
        }));

        app.use(passport.initialize());
        app.use(passport.session());

        this.app = app;
    }
};
