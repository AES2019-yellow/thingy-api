/*
 * File: /router.js
 * Project: thingy-api-yellow
 * File Created: Thu, 24th October 2019 11:47:47 am
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const Router = require('koa-router');
const schema = require('./models/validation')
const userRegSchema = schema.userRegSchema
const userUpdateSchema = schema.userUpdateSchema
var router = new Router();
const DEFAULT_AMOUNT = 10;
const DEVICE_ID = 'fe:1f:a1:94:c8:20'
const KEYS = {
    temperature: 'temperature',
    pressure: 'pressure',
    humidity: 'humidity',
    airQuality: 'airQuality'
}

const model = require('./model.js') // redis model
const db = require('./sqlite_db.js') // sqlite3 model
router
  /* resource end-points:
   * get last n resources
   * @ToDo: need to add device_id later
   * e.g. '/{device_id}/temperature/'
   * 
   */ 
  .get('/:device_name/temperature/', getTemperature)
  .get('/:device_name/airquality/',getAirQuality)
  .get('/:device_name/humidity/',getHumidity)
  .get('/:device_name/pressure/',getPressure)
  .get('/devices/', getDevices)
  //.get('/temperature/date/', getTemperatureByDate)
  .post('/register/', saveUser)
  .put('/profile/', updateUser)

async function getTemperature (ctx) {
    let device_name = ctx.params.device_name
    let last = ctx.query['last'];
    last = getAmount(last);
    let temperatureModel = new model(device_name,KEYS.temperature);
    let obj = await temperatureModel.findN(last);
    return ctx.body = obj;
}

async function getAirQuality (ctx) {
    let device_name = ctx.params.device_name
    let last = ctx.query['last'];
    last = getAmount(last);
    let airQualityModel = new model(device_name,KEYS.airQuality);
    let obj = await airQualityModel.findN(last);
    return ctx.body = obj; 
}

async function getHumidity (ctx) {
    let device_name = ctx.params.device_name
    let last = ctx.query['last'];
    last = getAmount(last);
    let humidityModel = new model(device_name,KEYS.humidity);
    let obj = await humidityModel.findN(last);
    return ctx.body = obj; 
}

async function getPressure (ctx) {
    let device_name = ctx.params.device_name
    let last = ctx.query['last'];
    last = getAmount(last);
    let pressureModel = new model(device_name,KEYS.pressure);
    let obj = await pressureModel.findN(last);
    return ctx.body = obj; 
}

async function getDevices (ctx) {
    let deviceModel = new model();
    let n = ctx.query['n']
    if (n == undefined || n == 0){
        n = 10
    }
    let obj = await deviceModel.findAllDevices(n);
    
    return ctx.body = obj;
}

async function getTemperatureByDate (ctx) {
    let start = ctx.query['start'];
    let end = ctx.query['end'];
    let temperatureModel = new model(DEVICE_ID,KEYS.temperature);
    let obj = await temperatureModel.findByDates(KEYS.temperature, start, end);
    return ctx.body = obj;
}

async function saveUser (ctx) {
    let data = ctx.request.body;
    if (data.user!=undefined || data.user!=null){
        try {
            let user = data.user;
            user = userRegSchema.validate(user).value
            let res = await db.saveUser(user)
            
            if (res){
            let out = {
                user:{
                    id: res.id,
                    username: res.username,
                    firstname: res.firstname,
                    lastname: res.lastname,
                    email: res.email
                },
                status: 'saved'
            }
            
            ctx.status = 200
            return ctx.body = out
            }
            else {
                ctx.status = 401
                return ctx.body = {
                    error: `User with email ${user.email} already exists.`
                }
                
            }
        } catch (error) {
            ctx.body = error;
            ctx.status = 404;
        }
      }
}

async function updateUser (ctx) {
    let data = ctx.request.body;
    if (data.user!=undefined || data.user!=null){
        try {
            let user = data.user
            user = userUpdateSchema.validate(data.user).value
            await db.updateUser(user).then((res,err)=>{
                if (res){
                    let out = {
                        user: {
                            id: res.id,
                            username: res.username,
                            firstname: res.firstname,
                            lastname: res.lastname,
                            email: res.email
                        }
                    }
                    ctx.status = 200
                    ctx.body = out
                    return ctx.body
                } else {
                    ctx.status = 401
                    ctx.body = {
                        error: `User with email ${user.email} dose not exist.`
                    }
                }
            });
        } catch (error) {
            ctx.body = error;
            ctx.status = 404;
        }
        
    }
}


function getAmount (amt) {
    let last = DEFAULT_AMOUNT;
    if (amt){
        last = amt;
        if(last>999 || last < 1){
            last = 10
        }
    }
    return last 
}

exports['default'] = router;
module.exports = exports['default'];

