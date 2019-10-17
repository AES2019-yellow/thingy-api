const mqtt = require('mqtt');
const host = "mqtt://mqtt.thing.zone";
const options = {
    port : 1896,
    username : "yellow",
    password : new Buffer.from('9f0f8f19e1'),
    topic: '#',
};


var client = mqtt.connect(host,options);

client.on('connect',()=>{
    client.subscribe('#', (err)=>{
        if (!err) {
            client.on('message', (topic, message, packet)=>{
                console.log("[Topic]: '"+topic+"' | [Message]: '"+ message + "'");
            });
        }
    });
});

