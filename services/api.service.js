"use strict";

const ApiGateway = require("moleculer-web");
const path = require("path");

module.exports = {
  name: "api",
  mixins: [ApiGateway],

  settings: {
    port: process.env.PORT || 3000,
    
    routes: [{
      path: "/api",
      whitelist: [
        "**"
      ],
      use: [
        ApiGateway.serveStatic(path.join(__dirname, "..", "public"))
      ],
      cors: {        
        origin: "*",        
        methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"]              
      },
      aliases: {        
        "POST /register": "auth.register",
        "POST /login": "auth.login",
        "POST /logout": "auth.logout",        
        "GET /timestamp": "timestamp.get",
        "POST /asset/meter": "meters.create",
        "GET /asset/meters" : "meters.list",
        "GET /data/advisor": "data.advisor"  
      },
      authorization: true
    }],

    assets: {
      folder: "public"
    }
  },

  methods: {
    async authorize(ctx, route, req) {
      let token;
      if (req.headers.authorization) {
        let type = req.headers.authorization.split(" ")[0];
        if (type === "Token" || type === "Bearer")
          token = req.headers.authorization.split(" ")[1];
      }

      if (token) {
        try {
          const user = await ctx.call("auth.resolveToken", { token });
          if (user) {
            ctx.meta.user = user;
            ctx.meta.token = token;
            return user;
          } else {
            return null;
          }
        } catch (err) {
          throw new UnAuthorizedError(err.message);
        }
      } else {
        return null;
      }
    }
  },

  actions: {
   
  }
};