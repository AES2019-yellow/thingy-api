/*
 * File: /model.js
 * Project: thingy-api-yellow
 * File Created: Thu, 24th October 2019 1:44:35 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const Redis = require("ioredis");

var redis_config = {
  host: "127.0.0.1",
  port: 6379,
  db: 3
};

const redis = new Redis(redis_config);


// SQLite implementation
// const sqlite3 = require("sqlite3").verbose();

const BaseModel = function(device_Id = null, category = null) {
  this.deviceId = device_Id;
  this.category = category;
};

BaseModel.prototype.getKey = function(key=null) {
  if (this.category != null && this.deviceId != null) {
    return this.deviceId.toString() + ":" + this.category.toString();
  }
  return key;
};

BaseModel.prototype.streamParser = function(stream) {
  return stream.map((element, index) => {
    /* key should be invisible to users */
    // let key = element[0];
    let value = element[1];
    let value_keys = value.filter((e, i) => i % 2 == 0);
    let value_values = value.filter((e, i) => i % 2 == 1);
    let content = {};
    value_keys.forEach((element, index) => {
      if (element == "timestamp") {
        let timestamp = value_values[index];
        value_values[index] = timeToISO(timestamp);
      }
      content[element] = value_values[index];
    });
    return content;
  });
};


BaseModel.prototype.keysParse = function(data){
  let devices = new Set()
  let keys = data[1]; 
  keys.forEach(key => {
    let device = key.split(':').slice(0,-1).join(':')
    devices.add(device)
  });
  let res = Array.from(devices)
  
  return {
    'devices': res,
    'size': res.length
  }


}

BaseModel.prototype.findN = async function(n,end="+",key=null) {
  let res = await redis.xrevrange(
    this.getKey(key),
    end,
    "-",
    "COUNT",
    n.toString()
  );
  res = this.streamParser(res);
  console.log(res);
  return res;
};

BaseModel.prototype.findAllDevices = async function(n=10) {
  let res = await redis.scan(0,'COUNT',100,'MATCH','*');
  res = this.keysParse(res);
  console.log(res);
  return res;
}

/*
BaseModel.prototype.findByDates = async function(db_name, startDate, endDate) {
  let start = new Date(startDate).getTime();
  let end = new Date(endDate);
  end = end.setDate(end.getDate() + 1);
  end = new Date(end).getTime();
  let sqlite_db = new sqlite3.Database("./db/thingyApiDB.db", err => {
    if (err) {
      console.error(err.message);
    }
  });
  let data = [];
  let sql = `SELECT * FROM ${db_name} WHERE timestamp BETWEEN ${start} and ${end}`;
  let res = await sqlite_db.all(sql, function(err, rows) {
    if (err) {
      console.log(err);
    } else {
      rows.forEach(row => {
        data.push(row)
      });
      return data;
    }
  });
  sqlite_db.close(err => {
    if (err) {
      console.error(err.message);
    }
  });

  return res;
}
*/

function timeToISO(timestamp) {
  let newDate = new Date();
  newDate.setTime(timestamp);
  return newDate.toISOString();
}



exports["default"] = BaseModel;
module.exports = exports["default"];
