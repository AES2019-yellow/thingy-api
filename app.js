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
const koaSwagger = require('koa2-swagger-ui');
const serve = require('koa-static');

const app = new Koa();

mqtt.client.on("connect",mqtt.doSub);

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(serve('./static'))
  .use(
    koaSwagger({
      routePrefix: '/swagger',
      swaggerOptions: {
        url: 'http://localhost:3000/thingy-api-yellow.yml'
      }
    })
  );

app.listen(3000);
