"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
const axios = require("axios");
const Influx = require('influx');

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
        
 
        const influx = new Influx.InfluxDB({
          host: process.env.INFLUX_HOST,
          port: process.env.INFLUX_PORT,
          database: process.env.INFLUX_DB,
          username: process.env.INFLUX_USER,
          password: process.env.INFLUX_PASSWORD
        });


        async function writeToInfluxDB(location, dataArray) {
          try {
            const points = dataArray.map(item => ({
              measurement: 'data',
              tags: { location: location },
              fields: { co2: item.co2 },
              timestamp: new Date(item.time)
            }));
        
            await influx.writePoints(points);
            console.log('Data written successfully to InfluxDB');
          } catch (error) {
            console.error('Error writing to InfluxDB:', error.message);
          }
        }

        await writeToInfluxDB(res.location.zip,res.data);
        return res;
      }
    },
    energyprice:{
      params: {
        "zip":"string",
        "meterid":"string"
      },
      async handler(ctx) {
        if(typeof ctx.meta.user == 'undefined') throw new MoleculerClientError("Invalid token", 401, "INVALID_TOKEN");
        await ctx.call("ratelimit.checkUpdate",{cost:4});
        const res = (await axios.get("https://api.corrently.io/v2.0/gsi/marketdata?zip="+ctx.params.zip+"&account="+ctx.params.meterid)).data; 
        // here we could store the data into a longer time storage like our influx
        
 
        const influx = new Influx.InfluxDB({
          host: process.env.INFLUX_HOST,
          port: process.env.INFLUX_PORT,
          database: process.env.INFLUX_DB,
          username: process.env.INFLUX_USER,
          password: process.env.INFLUX_PASSWORD
        });


        async function writeToInfluxDB(location, dataArray) {
          try {
            const pointsmarket = dataArray.map(item => ({
              measurement: 'data',
              tags: { location: location },
              fields: { marketprice: item.marketprice,localprice:item.localprice },
              timestamp: new Date(item.start_timestamp)
            }));        
            await influx.writePoints(pointsmarket);
          } catch (error) {
            console.error('Error writing to InfluxDB:', error.message);
          }
        }

        await writeToInfluxDB(ctx.params.zip,res.data);
        return res;
      }
    },
    gsi:{
      params: {
        "zip":"string",
        "meterid":"string"
      },
      async handler(ctx) {
        if(typeof ctx.meta.user == 'undefined') throw new MoleculerClientError("Invalid token", 401, "INVALID_TOKEN");
        await ctx.call("ratelimit.checkUpdate",{cost:6});
        const res = (await axios.get("https://api.corrently.io/v2.0/gsi/prediction?zip="+ctx.params.zip+"&account="+ctx.params.meterid)).data; 
        // here we could store the data into a longer time storage like our influx
        
 
        const influx = new Influx.InfluxDB({
          host: process.env.INFLUX_HOST,
          port: process.env.INFLUX_PORT,
          database: process.env.INFLUX_DB,
          username: process.env.INFLUX_USER,
          password: process.env.INFLUX_PASSWORD
        });


        async function writeToInfluxDB(location, dataArray) {
          try {
            const pointsmarket = dataArray.map(item => ({
              measurement: 'data',
              tags: { location: location },
              fields: { gsi: item.gsi,ewind:item.ewind,esolar:item.esolar },
              timestamp: new Date(item.timeStamp)
            }));        
            await influx.writePoints(pointsmarket);
          } catch (error) {
            console.error('Error writing to InfluxDB:', error.message);
          }
        }

        await writeToInfluxDB(ctx.params.zip,res.forecast);
        return res;
      }
    }
  }
}