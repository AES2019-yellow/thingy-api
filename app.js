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
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

const app = new Koa();


mqtt.client.on("connect",mqtt.doSub);

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
