"use strict";

const { MoleculerClientError } = require("moleculer").Errors;

module.exports = {
  name: "timestamp",

  actions: {
    get: {
      async handler(ctx) {
        if (!ctx.meta.user) {
          throw new MoleculerClientError("Unauthorized", 401, "UNAUTHORIZED");
        }

        await ctx.call("ratelimit.checkUpdate",{cost:1});

        const timestamp = Date.now();        
        await ctx.call("users.updateProfile", {
          id: ctx.meta.user._id,
          lastTimestamp: timestamp
        });

        return { timestamp };
      }
    }
  }  
};