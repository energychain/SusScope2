"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { MoleculerClientError } = require("moleculer").Errors;
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = {
  name: "auth",
  
  actions: {
    register: {
      params: {
        username: "string",
        password: "string"
      },
      async handler(ctx) {
        const users = await this.validateUser(ctx.params.username);
        if (users.length > 0) {            
          throw new MoleculerClientError("Username already exists!", 422, "", [{ field: "username", message: "already exists" }]);
        }
        const hashedPassword = await bcrypt.hash(ctx.params.password, 10);
        const newUser = await ctx.call("users.create", {
          username: ctx.params.username,
          password: hashedPassword
        });
        const _jwt = this.generateJWT(newUser);        
        return {token:_jwt};
      }
    },

    login: {
      params: {
        username: "string",
        password: "string"
      },
      async handler(ctx) {
        const users = await this.validateUser(ctx.params.username);
        console.log('Users',users);
        if (users.length === 0)
          throw new MoleculerClientError("Username or password is invalid!", 422, "", [{ field: "username", message: "is invalid" }]);

        const user = users[0];  // Assume the first user is the one we want
        const res = await bcrypt.compare(ctx.params.password, user.password);
        if (!res)
          throw new MoleculerClientError("Username or password is invalid!", 422, "", [{ field: "password", message: "is invalid" }]);
        
        return this.generateJWT(user);
      }
    },

    logout: {
      handler(ctx) {
        return { message: "Logged out successfully" };
      }
    },

    resolveToken: {
      params: {
        token: "string"
      },
      async handler(ctx) {
        try {
          const decoded = await new Promise((resolve, reject) => {
            jwt.verify(ctx.params.token, process.env.JWT_SECRET, (err, decoded) => {
              if (err) reject(err);
              else resolve(decoded);
            });
          });

          if (decoded.id)
            return ctx.call("users.get", { id: decoded.id });
        } catch (err) {
            console.log("Error in resolveToken",err);
          throw new MoleculerClientError("Invalid token", 401, "INVALID_TOKEN");
        }
      }
    },

    googleAuth: {
      handler(ctx) {
        return new Promise((resolve, reject) => {
          passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback"
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              const user = await ctx.call("users.findOrCreate", { 
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName
              });
              done(null, user);
            } catch (error) {
              done(error);
            }
          }));

          passport.authenticate("google", { scope: ["profile", "email"] })(ctx.params.req, ctx.params.res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    },

    googleAuthCallback: {
      async handler(ctx) {
        return new Promise((resolve, reject) => {
          passport.authenticate("google", async (err, user) => {
            if (err) return reject(err);
            if (!user) return reject(new Error("Failed to authenticate with Google"));

            try {
              const token = await this.generateJWT(user);
              resolve({ token });
            } catch (error) {
              reject(error);
            }
          })(ctx.params.req, ctx.params.res);
        });
      }
    }
  },

  methods: {
    async validateUser(username) {
      return await this.broker.call("users.find", { query: { username } },{ meta: { $cache: false } });
    },

    generateJWT(user) {
      const today = new Date();
      const exp = new Date(today);
      exp.setDate(today.getDate() + 60);
      const _jwt = jwt.sign({
        id: user._id,
        username: user.username,
        exp: Math.floor(exp.getTime() / 1000)
      }, process.env.JWT_SECRET);
        
      return _jwt;
    }
  }
};