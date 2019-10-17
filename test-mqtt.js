/*
 * File: /test-mqtt.js
 * Project: thingy-api-yellow
 * File Created: Thu, 17th October 2019 3:08:14 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const mqtt = require("async-mqtt") // changed to async lib, canbe then integrated in koa
const host = "mqtt://mqtt.thing.zone";
const options = {
    port : 1896,
    username : "yellow",
    password : new Buffer.from('9f0f8f19e1'),
    topic: '#',
};

const client = mqtt.connect(host,options);

const doSub = async () => {
    console.log("Starting...");
    try {
        await client.subscribe('#').then(displaySub);
    } catch (e) {
        console.log(e.stack);
        process.exit();
        
    }
}

const displaySub = () => {
        client.on('message',(topic,message,packet)=>{
            // @Todo serialization 
            console.log("[Topic]: '"+ topic +"' | [Message]: '"+ message + "'"); 
        });
    }

    client.on("connect",doSub);


