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
const koaJwt = require('koa-jwt');
const jwt = require('jsonwebtoken');
const app = new Koa();
const SECRET = 'Thingy-Yellow';


mqtt.client.on("connect",mqtt.doSub);
mqtt.redisSub();

app
  .use(bodyParser())
  .use(cors())
  .use(router.allowedMethods())
  .use(serve('./static'))
  .use(
    koaJwt({
      secret: SECRET
    }).unless({
      path: [/^\/login/, /^\/register/,/^\/swagger/,/^\/activation\/(.*)/]
    })
  );
  

  //  middleware to intercept the authorization.
  app.use((ctx, next) => {
    if (ctx.header && ctx.header.authorization) {
      const parts = ctx.header.authorization.split(' ');
      if (parts.length === 2) {
        //get token
        const scheme = parts[0];
        const token = parts[1];
        
        if (/^Bearer$/i.test(scheme)) {
          try {
            //jwt.verify
            jwt.verify(token, SECRET, {
              complete: true
            });
          } catch (error) {
            ctx.body = {
              error: "Token expired."
            }
          }
        }
      }
    }
    return next().catch(err => {
      if (err.status === 401) {
        ctx.status = 401;
        ctx.body =
          'Protected resource, use Authorization header to get access\n';
      } else {
        throw err;
      }});
   });

app.use(router.routes())
  .use(
    koaSwagger({
      routePrefix: '/swagger',
      swaggerOptions: {
        url: 'http://localhost:3000/thingy-api-yellow.yml'
      }
    })
  );


app.listen(3000);

