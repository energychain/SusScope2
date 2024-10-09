"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const axios = require("axios");

module.exports = {
  name: "data",

  actions: {
    advisor:{
      params: {
        "zip":"string",
        "meterid":"string"
      },
      async handler(ctx) {
        if(typeof ctx.meta.user == 'undefined') throw new MoleculerClientError("Invalid token", 401, "INVALID_TOKEN");
        await ctx.call("ratelimit.checkUpdate",{cost:4});
        const res = (await axios.get("https://api.corrently.io/v2.0/gsi/advisor?q="+ctx.params.zip+"&account="+ctx.params.meterid)).data; 
        // here we could store the data into a longer time storage like our influx
        return res;
      }
    }
  }
}