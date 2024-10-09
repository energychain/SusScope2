"use strict";

const { MoleculerClientError } = require("moleculer").Errors;

module.exports = {
  name: "ratelimit",

  actions: {
    async checkUpdate(ctx) {
        if(typeof ctx.params.cost == 'undefined') ctx.params.cost = 1;

        const user = await ctx.call("users.get", { id: ctx.meta.user._id }, { meta: { $cache: false } });
       
       if (user.rateLimit <= 0) {
         throw new MoleculerClientError("Rate limit exceeded", 429, "RATE_LIMIT_EXCEEDED");
       }
 
       await ctx.call("users.updateRateLimit", {
         id: user._id,
         rateLimit: user.rateLimit - ctx.params.cost
       });
       
     }
  }
}