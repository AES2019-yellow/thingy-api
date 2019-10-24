/*
 * File: /model.js
 * Project: thingy-api-yellow
 * File Created: Thu, 24th October 2019 1:44:35 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const Redis = require('ioredis');

var redis_config = {
    host: "127.0.0.1",
    port: 6379,
    db:3
};

const redis = new Redis(redis_config);

const BaseModel = function (device_Id=null,category=null){
    this.deviceId = device_Id;
    this.category = category;
}

 BaseModel.prototype.getKey = function (){
    if(this.category!=null && this.deviceId!=null){
        return this.deviceId.toString()+':'+this.category.toString();
    }
    return null;
}

 BaseModel.prototype.streamParser = function (stream){
    let key = '/* need to get this in model */';
    let res = {};
    res[key] = stream[0];
    let keys = stream[1].filter((e, i) => i % 2 == 0);
    let values = stream[1].filter((e, i) => i % 2 == 1);
    let content = {};
    keys.forEach((element, index) => {
        content[element] = values[index];
    });
    Object.assign(res, content);
    return res;
}

BaseModel.prototype.findN = async function(n){
    let res = await redis.xrevrange(this.getKey(),'+','-','COUNT',n.toString());
    // res = this.streamParser(res);
    console.log(res);
    return res;
}



exports['default'] = BaseModel;
module.exports = exports['default'];




