"use strict";

const { MoleculerClientError } = require("moleculer").Errors;

module.exports = {
  name: "asset",

  actions: {
    get: {
      async handler(ctx) {
        if (!ctx.meta.user) {
          throw new MoleculerClientError("Unauthorized", 401, "UNAUTHORIZED");
        }

        await this.checkAndUpdateRateLimit(ctx);

        const timestamp = Date.now();        
        await ctx.call("users.updateProfile", {
          id: ctx.meta.user._id,
          lastTimestamp: timestamp
        });

        return { timestamp };
      }
    }
  },

  methods: {
    async checkAndUpdateRateLimit(ctx) {
       const user = await ctx.call("users.get", { id: ctx.meta.user._id }, { meta: { $cache: false } });
      
      if (user.rateLimit <= 0) {
        throw new MoleculerClientError("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED");
      }

      await ctx.call("users.updateRateLimit", {
        id: user._id,
        rateLimit: user.rateLimit - 1
      });
      
    }
  }
};