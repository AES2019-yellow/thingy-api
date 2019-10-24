/*
 * File: /app.js
 * Project: thingy-api-yellow
 * File Created: Sun, 20th October 2019 4:23:50 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const router = require('./router.js')
const mqtt = require('./mqtt_client');
const Koa = require('koa');
const Redis = require('ioredis');
const bodyParser = require('koa-bodyparser');

const app = new Koa();

var redis_config = {
    host: "127.09.0.1",
    port: 6379,
    db:3
};

mqtt.client.on("connect",mqtt.doSub);

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);