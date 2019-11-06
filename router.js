/*
 * File: /router.js
 * Project: thingy-api-yellow
 * File Created: Thu, 24th October 2019 11:47:47 am
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const Router = require('koa-router');
var router = new Router();
const DEFAULT_AMOUNT = 10;
const DEVICE_ID = 'fe:1f:a1:94:c8:20'
const KEYS = {
    temperature: 'temperature',
    pressure: 'pressure',
    humidity: 'humidity',
    airQuality: 'airQuality'
}

const model = require('./model.js')
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

