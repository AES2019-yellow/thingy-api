/*
 * File: /mqtt_client.js
 * Project: thingy-api-yellow
 * File Created: Sun, 20th October 2019 4:35:43 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const mqtt = require("async-mqtt"); // changed to async lib, can be then integrated in koa
const host = "mqtt://mqtt.thing.zone";
const options = {
  port: 1896,
  username: "yellow",
  password: new Buffer.from("9f0f8f19e1"),
  topic: "#"
};

const Redis = require("ioredis");

var redis_config = {
  host: "127.0.0.1",
  port: 6379,
  db: 3
};

const redis = new Redis(redis_config);

// SQLite implementation
const sqlite3 = require("sqlite3").verbose();

const TABLE_NAMES = {
  tp: "temperature",
  aq: "airquality",
  pr: "pressure",
  hm: "humidity"
};

// Counters to control the sqlite storage
let count_temperature = 0, //meassure each 2s : 300 for 10 min
  count_pressure = 0, //meassure each 2s : 300 for 10 min
  count_airQuality = 0, //meassure each 10s : 60 for 10 min
  count_humidity = 0; //meassure each 2s : 300 for 10 min

const MAX_COUNTER_TEMPERATURE = (10 * 60) / 2;
const MAX_COUNTER_PRESSURE = (10 * 60) / 2;
const MAX_COUNTER_AIRQUALITY = (10 * 60) / 10;
const MAX_COUNTER_HUMIDITY = (10 * 60) / 2;

const SubModel = function() {};

const MAX_EXPIRATION = 120; //in minutes

var sub = new SubModel();

SubModel.prototype.dispatcher = function(topic, message, packet) {
  let topic_arr = topic.split("/");
  if (topic_arr[1] == "Thingy Environment Service") {
    const thingy_id = topic_arr[0];
    const env_type = topic_arr[2];
    let env_types = {
      "Thingy Temperature Characteristic": "temperature",
      "Thingy Pressure Characteristic": "pressure",
      "Thingy Air Quality Characteristic": "airQuality",
      "Thingy Humidity Characteristic": "humidity",
      "Thingy Light Intensity Characteristic": "lightIntensity",

      // Services below belong to the
      // 'Thingy LED Characteristic':'led',
      // 'Thingy Button Characteristic':'button',

      default: "otherEnvServices"
    };
    var topic_type = env_types[env_type];
    // console.log(sub[topic_type]);
    if (topic_type != "otherEnvServices") {
      return sub[topic_type](thingy_id, topic_type, message, packet);
    }
  }
};

SubModel.prototype.temperature = async (
  thingy_id,
  topic_type,
  message,
  packet
) => {
  let res = false;
  let timestamp = getTime();
  let temperature_arr = message.toString().split(",");
  let temperature_val = parseFloat(
    temperature_arr[0] + "." + temperature_arr[1]
  );
  let key = thingy_id + ":" + topic_type;
  let exp = getExpiration(MAX_EXPIRATION);
  res = await redis.xadd(key, "MAXLEN", "~", exp, "*", topic_type, temperature_val, "timestamp", timestamp);
  params = {
    type: "T",
    temperature: temperature_val,
    timestamp: timestamp,
    lat: 0.0,
    long: 0.0
  };
  if (count_temperature == 0) {
    await savePermanentData(TABLE_NAMES["tp"], params);
  }
  if (count_temperature == MAX_COUNTER_TEMPERATURE) {
    await savePermanentData(TABLE_NAMES["tp"], params);
    count_temperature = 0;
  }
  count_temperature++;
  console.log(res);
  return res; // key entry returns if successful
};

SubModel.prototype.pressure = async function(
  thingy_id,
  topic_type,
  message,
  packet
) {
  let res = false;
  let timestamp = getTime();
  let pressure_arr = message.toString().split(",");
  let pressure_val = parseFloat(pressure_arr[0] + "." + pressure_arr[1]);
  let key = thingy_id + ":" + topic_type;
  let exp = getExpiration(MAX_EXPIRATION);
  res = await redis.xadd(key, "MAXLEN", "~", exp, "*", topic_type, pressure_val, "timestamp", timestamp);
  params = {
    type: "P",
    pressure: pressure_val,
    timestamp: timestamp,
    lat: 0.0,
    long: 0.0
  };
  if (count_pressure == 0) {
    await savePermanentData(TABLE_NAMES["pr"], params);
  }
  if (count_pressure == MAX_COUNTER_PRESSURE) {
    await savePermanentData(TABLE_NAMES["pr"], params);
    count_pressure = 0;
  }
  count_pressure++;
  console.log(res);
  return res; // key entry returns if successful
};

SubModel.prototype.airQuality = async function(
  thingy_id,
  topic_type,
  message,
  packet
) {
  let res = false;
  let timestamp = getTime();
  let topic_types = ["CO2", "TVOC"];
  let airQ_arr = message.toString().split(",");
  let co2_val = parseInt(airQ_arr[0]);
  let voc_val = parseInt(airQ_arr[1]);
  let key = thingy_id + ":" + topic_type;
  let exp = getExpiration(MAX_EXPIRATION);
  res = await redis.xadd(key, "MAXLEN", "~", exp, "*", topic_types[0], co2_val, topic_types[1], voc_val, "timestamp", timestamp);
  params = {
    type: "A",
    co2: co2_val,
    tvoc: voc_val,
    timestamp: timestamp,
    lat: 0.0,
    long: 0.0
  };
  if (count_airQuality == 0) {
    await savePermanentData(TABLE_NAMES["aq"], params);
  }
  if (count_airQuality == MAX_COUNTER_AIRQUALITY) {
    await savePermanentData(TABLE_NAMES["aq"], params);
    count_airQuality = 0;
  }
  count_airQuality++;
  console.log(res);
  return res; // key entry returns if successful
};

SubModel.prototype.humidity = async function(
  thingy_id,
  topic_type,
  message,
  packet
) {
  let res = false;
  let timestamp = getTime();
  let humidity_val = parseInt(message.toString());
  let key = thingy_id + ":" + topic_type;
  let exp = getExpiration(MAX_EXPIRATION);
  res = await redis.xadd(key, "MAXLEN", "~", exp, "*", topic_type, humidity_val, "timestamp", timestamp);
  params = {
    type: "H",
    humidity: humidity_val,
    timestamp: timestamp,
    lat: 0.0,
    long: 0.0
  };
  if (count_humidity == 0) {
    await savePermanentData(TABLE_NAMES["hm"], params);
  }
  if (count_humidity == MAX_COUNTER_HUMIDITY) {
    await savePermanentData(TABLE_NAMES["hm"], params);
    count_humidity = 0;
  }
  count_humidity++;
  console.log(res);
  return res; // key entry returns if successful
};

SubModel.prototype.lightIntensity = async function(
  thingy_id,
  topic_type,
  message,
  packet
) {
  let res = false;
  let timestamp = getTime();
  let light_vals = message.toString().split(",");
  let light_types = ["R", "G", "B", "A"];
  let key = thingy_id + ":" + topic_type;
  let exp = getExpiration(MAX_EXPIRATION);
  res = await redis.xadd(
    key,
    "MAXLEN",
    "~",
    exp,
    "*",
    light_types[0],
    light_vals[0],
    light_types[1],
    light_vals[1],
    light_types[2],
    light_vals[2],
    light_types[3],
    light_vals[3],
    "timestamp",
    timestamp
  );
  console.log(res);
  return res;
};

var getTime = () => {
  let date = new Date();
  return (timestap = date.getTime());
};

var getExpiration = seconds => {
  return (minutes = (seconds / 5) * 60);
};

var savePermanentData = async (tableName, params) => {
  let sqlite_db = new sqlite3.Database("./db/thingyApiDB.db", err => {
    if (err) {
      console.error(err.message);
    }
  });

  if ("type" in params) {
    let query, values;
    switch (params["type"]) {
      case "T":
        query = `INSERT INTO ${tableName} (temperature, timestamp, lat, long) VALUES (?, ?, ?, ?)`;
        values = [
          params["temperature"],
          params["timestamp"],
          params["lat"],
          params["long"]
        ];
        break;
      case "P":
        query = `INSERT INTO ${tableName} (pressure, timestamp, lat, long) VALUES (?, ?, ?, ?)`;
        values = [
          params["pressure"],
          params["timestamp"],
          params["lat"],
          params["long"]
        ];
        break;
      case "A":
        query = `INSERT INTO ${tableName} (co2, tvoc, timestamp, lat, long) VALUES (?, ?, ?, ?, ?)`;
        values = [
          params["co2"],
          params["tvoc"],
          params["timestamp"],
          params["lat"],
          params["long"]
        ];
        break;
      case "H":
        query = `INSERT INTO ${tableName} (humidity, timestamp, lat, long) VALUES (?, ?, ?, ?)`;
        values = [
          params["humidity"],
          params["timestamp"],
          params["lat"],
          params["long"]
        ];
        break;
      
      default:
        break;
    }

    sqlite_db.run(query, values, err => {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      console.log(`A row has been inserted in ${tableName}`);
    });
  }

  sqlite_db.close(err => {
    if (err) {
      console.error(err.message);
    }
  });
};

var exports = (module.exports = {});

exports.client = mqtt.connect(host, options);

exports.doSub = async () => {
  console.log("Starting...");
  try {
    await exports.client.subscribe("#").then(onMessage);
  } catch (e) {
    console.log(e.stack);
    process.exit();
  }
};

const onMessage = () => {
  exports.client.on("message", (topic, message, packet) => {
    // @Todo serialization
    // console.log("[Topic]: '"+ topic +"' | [Message]: '"+ message + "'");
    let res = sub.dispatcher(topic, message, packet);
  });
};
