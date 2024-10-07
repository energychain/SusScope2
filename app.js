require('dotenv').config();

const { ServiceBroker } = require("moleculer");

const broker = new ServiceBroker({
    nodeID: process.env.NATS_NODE_ID,
    transporter:process.env.TRANSPORTER
});

// Load services
broker.loadService("./services/auth.service.js");
broker.loadService("./services/gateway.service.js");

// Start broker
broker.start();