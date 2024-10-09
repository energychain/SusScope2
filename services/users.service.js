"use strict";

const DbService = require("moleculer-db");
const MongoDBAdapter = require("moleculer-db-adapter-mongo");

module.exports = {
  name: "users",
  mixins: [DbService],
  adapter: new MongoDBAdapter(process.env.MONGODB_URI),
  collection: process.env.MONGO_USER_COLLECTION,

  settings: {
    fields: ["_id", "username", "password", "email", "googleId", "name", "rateLimit", "lastTimestamp"]
  },

  actions: {
    create: {
      params: {
        username: "string",
        password: "string"
      },
      handler(ctx) {
        const entity = ctx.params;
        entity.rateLimit = 10000; // Default rate limit
        return this.adapter.insert(entity);
      }
    },

    updateProfile: {
      params: {
        id: "string",
        lastTimestamp: "number"
      },
      handler(ctx) {
        return this.adapter.updateById(ctx.params.id, { $set: { lastTimestamp: ctx.params.lastTimestamp } });
      }
    },

    updateRateLimit: {
      params: {
        id: "string",
        rateLimit: "number"
      },
      handler(ctx) {
        return this.adapter.updateById(ctx.params.id, { $set: { rateLimit: ctx.params.rateLimit } });
      }
    },

    findOrCreate: {
      params: {
        googleId: "string",
        email: "string",
        name: "string"
      },
      handler(ctx) {
        return this.adapter.findOne({ googleId: ctx.params.googleId })
          .then(user => {
            if (user) return user;
            return this.adapter.insert({
              googleId: ctx.params.googleId,
              email: ctx.params.email,
              name: ctx.params.name,
              rateLimit: 100 // Default rate limit
            });
          });
      }
    }
  }
};