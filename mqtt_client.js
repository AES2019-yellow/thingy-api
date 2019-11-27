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

const redisModel = require('./model.js')


const redis = new Redis(redis_config);
const redisSub = new Redis(redis_config);
const redisPub = new Redis(redis_config); 

// SQLite implementation
// const sqlite3 = require("sqlite3").verbose();

const db = require('./sqlite_db.js');
const getExpiration = (seconds,freq=2) => {
  return (minutes = (seconds / freq) * 60);
};
const MAX_EXPIRATION = 120; // minutes
const PERSIST_PERIODS = {
  temperature: getExpiration(30,2),
  pressure: getExpiration(30,2),
  humidity: getExpiration(30,2),
  airQuality: getExpiration(30,10)
}
let counters = [];

const SubModel = function() {};


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
  // [Topic]: 'BLE2MQTT-EA5C/Position' | [Message]: '46.79430,7.15376'
  // [Topic]: 'BLE2MQTT-EA5C/Speed' | [Message]: '0.000000'
  if (topic_arr[1] == "Position" || topic_arr[1] == "Speed"){
    let topic_type= topic_arr[1]
    return sub.lbs(topic_type,message,packet)
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

  // console.log(res);
  redisPub.publish("xadd","/"+key+":"+res+"/")
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

  // console.log(res);
  redisPub.publish("xadd","/"+key+":"+res+"/")
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
  let exp = getExpiration(MAX_EXPIRATION,10);
  res = await redis.xadd(key, "MAXLEN", "~", exp, "*", topic_types[0], co2_val, topic_types[1], voc_val, "timestamp", timestamp);

  // console.log(res);
  redisPub.publish("xadd","/"+key+":"+res+"/")
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
  
 // console.log(res);
  redisPub.publish("xadd","/"+key+":"+res+"/")
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
  let exp = getExpiration(MAX_EXPIRATION,10);
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
  // console.log(res);
  return res;
};

SubModel.prototype.lbs = async function(
  topic_type,
  message,
  packet
) {
  let res = false;
  let timestamp = getTime();
  if (topic_type=="Position"){
    let topic_types = ["Lat", "Long"];
    let pos_arr = message.toString().split(",");
    let lat_val = parseFloat(pos_arr[0]);
    let long_val = parseFloat(pos_arr[1]);
    if ((lat_val !=0 && lat_val!=NaN) && (long_val !=0 && long_val != NaN)){
      let key = topic_type.toLowerCase();
      let exp = getExpiration(MAX_EXPIRATION,10);
      res = await redis.xadd(key, "MAXLEN", "~", exp, "*", topic_types[0], lat_val, topic_types[1], long_val, "timestamp", timestamp);
      // console.log(res);
      redisPub.publish("xadd","/"+key+":"+res+"/")
      return res; // key entry returns if successful
    }
    
    
  }
  if (topic_type=="Speed"){
    let speedStr = message.toString();
    let speed_val = parseFloat(speedStr);
    let key = topic_type.toLowerCase();
    let exp = getExpiration(MAX_EXPIRATION,10);
    res = await redis.xadd(key, "MAXLEN", "~", exp, "*", key, speed_val, "timestamp", timestamp);

    // console.log(res);
    redisPub.publish("xadd","/"+key+":"+res+"/")
    return res; // key entry returns if successful
  }
  
};

var getTime = () => {
  let date = new Date();
  return (timestap = date.getTime());
};



// counter for save data to sqlite

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

exports.redisSub = function(){
  redisSub.subscribe("xadd", function(err,count){
  // Now we are subscribed to both the 'xadd' channel.
  // `count` represents the number of channels we are currently subscribed to.
  // console.log("xadd",count);
  if(!err){
    redisSub.on("message", function(channel, message){
      persistData(channel,message);
      // console.log("Receive message %s from channel %s", message, channel);


    });
  }
  });
}

const parseRedisMsg = function (channel, message){
  message = message.split('/')[1]
  let message_arr = message.split(':')
  // 0-5 is device, 6 is type, 7 is key returned from redis
  let device_name = message_arr.slice(0,6).join(':');
  let type = message_arr[6];
  let key = message_arr[7];
  return [device_name,type,key];
}

const getCounter = function (counters,device_name,type){
  /*let aCounter = counters.filter((ele,ind)=>{
    ele['device_name'] == device_name;
    // console.log('ele:',ele)
  })[0];*/
  let aCounter = null;
  for (const counter of counters) {
    if (counter.device_name ==device_name) {
      aCounter = counter;
      break
    }
  }
  if (aCounter == undefined || aCounter == null){
    aCounter = new Object();
    aCounter['device_name'] = device_name;
    aCounter['data'] = new Object()
    aCounter['data'][type] = 0;  // counter for resource
    counters.push(aCounter)
  } else if (aCounter['data'][type]==undefined || aCounter['data'][type]==null){
    (aCounter['data'])[type] = 0;
  }

  return aCounter;
}

const meanFromRedis = async function(device_name,type,exp,end){
    console.log("device_name: ",device_name)
    console.log("type: ",type)

    let typeModel = await new redisModel(device_name,type);
    console.log("end",end)
    let redis_res = await typeModel.findN(exp,end);
    console.log("redis_res", redis_res)
    let from = null;
    let to = null;
    if (type!="airQuality"){
      let sum = 0
      for (const index of redis_res.keys()) {
        if (index==0){
          to = redis_res[index].timestamp;
        }
        if (index==redis_res.length-1){
          from = redis_res[index].timestamp; 
        }
        sum += parseFloat(redis_res[index][type]);
      }
      let mean = parseFloat((sum/redis_res.length).toFixed(2));
      let res =  {
        type:type,
        from:from,
        to:to,
        means:[mean]
      }
        console.log("Non-Air Res:",res)
        return res;
      } 
     else {
      // for airQuality we have 2 values:
      let sum_co2 = 0;
      let sum_tvoc = 0;
      for (const index of redis_res.keys()) {
        if (index==0){
          to = redis_res[index].timestamp;
        }
        if (index==redis_res.length-1){
          from = redis_res[index].timestamp; 
        }
        sum_co2 += parseFloat(redis_res[index]['CO2']);
        sum_tvoc += parseFloat(redis_res[index]['TVOC']); 
      }
      let mean_co2 = parseFloat((sum_co2/redis_res.length).toFixed(2));
      let mean_tvoc = parseFloat((sum_tvoc/redis_res.length).toFixed(2));
      let res = {
        type:type,
        from:from,
        to:to,
        means:[mean_co2, mean_tvoc]
      }
      console.log("Air Res:",res)
      return res 
   }
  }


const persistData = async function (channel,message){
  
  let redis_msg_arr = parseRedisMsg(channel,message);
  let device_name = redis_msg_arr[0];
  let type = redis_msg_arr[1];
  let key = redis_msg_arr[2];

  // get counter
  let aCounter = getCounter(counters,device_name,type);
  // get mean value of records from redis 
  // and save into sequelize model / SQLite
  let exp = PERSIST_PERIODS[type];
  if (aCounter['data'][type]%exp == 0 && aCounter['data'][type]!=0){
    if (aCounter['data'][type]>0){
      aCounter['data'][type]=0
    }
    
    let data  = await meanFromRedis(device_name,type,exp,key);
    await saveDispatcherByType(device_name,data);
  }  
  // set counter
  aCounter['data'][type]++;
}

const saveDispatcherByType = async (device_name,data)=>{
  let types_map = {
    temperature: db.saveTemperatureByDeviceName,
    pressure: db.savePressureByDeviceName,
    humidity: db.saveHumidityByDeviceName,
    airQuality: db.saveAirQualityByDeviceName
  }
  return await types_map[data.type].apply(null,[device_name,data])
}