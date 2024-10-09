"use strict";

require('dotenv').config();

module.exports = {
  namespace: "SusScope2",
  nodeID: process.env.NATS_NODE_ID,

  transporter: process.env.TRANSPORTER,

  logger: true,
  logLevel: "info",

  cacher: "Memory",

  serializer: "JSON",

  requestTimeout: 10 * 1000,

  retryPolicy: {
    enabled: true,
    retries: 5,
    delay: 100,
    maxDelay: 1000,
    factor: 2,
    check: err => err && !!err.retryable
  },

  maxCallLevel: 100,
  heartbeatInterval: 10,
  heartbeatTimeout: 30,

  tracking: {
    enabled: true,
    shutdownTimeout: 5000,
  },

  disableBalancer: false
};