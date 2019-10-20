const mqtt = require("async-mqtt") // changed to async lib, canbe then integrated in koa
const host = "mqtt://mqtt.thing.zone";
const options = {
    port : 1896,
    username : "yellow",
    password : new Buffer.from('9f0f8f19e1'),
    topic: '#',
};

const Redis = require('ioredis');

var redis_config = {
    host: "127.0.0.1",
    port: 6379,
    db:3
};

const redis = new Redis(redis_config);

const SubModel = function (){}

var sub = new SubModel();

SubModel.prototype.dispatcher = function (topic, message, packet) {
    let topic_arr = topic.split('/');
    if (topic_arr[1] == "Thingy Environment Service") {
        const thingy_id = topic_arr[0];
        const env_type  = topic_arr[2];
        let env_types = {
            'Thingy Temperature Characteristic': 'temperature',
            'Thingy Pressure Characteristic': 'pressure',
            'Thingy Air Quality Characteristic': 'airQuality',
            'Thingy Humidity Characteristic': 'humidity',
            'Thingy Light Intensity Characteristic': 'lightIntensity',
            
            // 'Thingy LED Characteristic':'led',
            // 'Thingy Button Characteristic':'button',

            'default':'otherEnvServices',
        };
        var topic_type = env_types[env_type];
        // console.log(sub[topic_type]);
        if (topic_type == 'temperature'){
            return sub[topic_type](thingy_id,topic_type,message,packet);

        }
    }

}

SubModel.prototype.temperature = async (thingy_id,topic_type,message, packet) => {
    let res = false;
    let timestamp = getTime();
    let temperature_arr = message.toString().split(',');
    let temperature_val = parseFloat(temperature_arr[0]+"."+temperature_arr[1]);
    let key = thingy_id+':'+topic_type;
    res = await redis.xadd(key,'*','temperature',temperature_val.toString());
    console.log(res);
    return res; // key entry returns if successful

}

SubModel.prototype.pressure = function (thingy_id,topic,message,packet) {

}

SubModel.prototype.airQuality = function (thingy_id,topic,message,packet) {

}

var getTime = () =>{
    let date = new Date();
    return timestap = date.getTime();
}

var exports = module.exports = {};

exports.client = mqtt.connect(host,options);

exports.doSub = async () => {
    console.log("Starting...");
    try {
        await exports.client.subscribe('#').then(onMessage);
    } catch (e) {
        console.log(e.stack);
        process.exit();
        
    }
}

const onMessage = () => {
        exports.client.on('message',(topic,message,packet)=>{
            
            // @Todo serialization 
            // console.log("[Topic]: '"+ topic +"' | [Message]: '"+ message + "'");
            let res = sub.dispatcher(topic,message,packet);
        });
    }
