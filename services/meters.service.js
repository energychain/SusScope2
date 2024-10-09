"use strict";

const DbService = require("moleculer-db");
const MongoDBAdapter = require("moleculer-db-adapter-mongo");
const { MoleculerClientError } = require("moleculer").Errors;
const ethers = require("ethers");

module.exports = {
  name: "meters",
  mixins: [DbService],
  adapter: new MongoDBAdapter(process.env.MONGODB_URI),
  collection: process.env.MONGO_METERS_COLLECTION,

  settings: {
    fields: ["_id", "meterid","username", "meterName", "zip", "city", "type","assetupdate","assetcreate","privateKey"]
  },

  actions: {
    create: {
      params: {              
        meterName: "string",
        zip: "string",
        city: "string",
        type: "string"
      },
      async handler(ctx) {
        const entity = ctx.params;
        if(typeof ctx.meta.user == 'undefined') throw new MoleculerClientError("Invalid token", 401, "INVALID_TOKEN");
        await ctx.call("ratelimit.checkUpdate",{cost:50});
        const rw = ethers.Wallet.createRandom();
        entity.username = ctx.meta.user.username;  
        entity.assetcreate = new Date().getTime();       
        entity.assetupdate = new Date().getTime();
        entity.meterid = rw.address;
        entity.privateKey = rw.privateKey;        
        await ctx.broker.cacher.clean("meters.**");
        return this.adapter.insert(entity);
      }
    },
    list: {
      async handler(ctx) {
        await ctx.call("ratelimit.checkUpdate",{cost:1});
        const result = await this.adapter.find({query:{ username: ctx.meta.user.username }});
        for(let i=0;i<result.length;i++) {
          delete result[i]._id;
          delete result[i].privateKey;
        }
        return result;
      }
    }
  }
};