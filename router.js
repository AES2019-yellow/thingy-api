/*
* File: /router.js
* Project: thingy-api-yellow
* File Created: Thu, 24th October 2019 11:47:47 am
* Author: Yi Zhang (yi.zhang@unifr.ch)
* -----
* Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
*/

const Router = require('koa-router');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "Thingy-Yellow";
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
.post('/login/', fetchToken)
.get('activation','/activation/:token', activateUser)

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
            user = userRegSchema.validate(user).value;
            const saltRounds = 10;
            salt = bcrypt.genSaltSync(saltRounds)
            user.password = bcrypt.hashSync(user.password,salt);
            let res = await db.saveUser(user);
                    if (res){
                        // createActivation link
                        token = jwt.sign({
                            user:{
                                id: res.id,
                                username: res.username,
                                firstname: res.firstname,
                                lastname: res.lastname,
                                email: res.email
                            }   
                        },JWT_SECRET);

                        let out = {
                            user:{
                                id: res.id,
                                username: res.username,
                                firstname: res.firstname,
                                lastname: res.lastname,
                                email: res.email
                            },
                            activation: 'http://' + ctx.host + router.url('activation', token),
                            status: 'saved'

                        }
                        
                        ctx.status = 200
                        ctx.body = out
                    }
                    else {
                        ctx.status = 401
                        return ctx.body = {
                            error: `User with email ${user.email} already exists.`
                        }
                    }
            // async not work...
            /*        
            bcrypt.genSalt(saltRounds,async function(err,salt){
                bcrypt.hash(user.password,salt,async function(err,hash){
                    user.password = hash; // use hash as password
                    let res = await db.saveUser(user);
                    if (res){
                        // createActivation link
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
                        ctx.body = out
                    }
                    else {
                        ctx.status = 401
                        return ctx.body = {
                            error: `User with email ${user.email} already exists.`
                        }
                    }
                })
            })
            */
        } catch (error) {
            ctx.body = error;
            ctx.status = 404;
        }
    }
}

async function fetchToken(ctx) {
    // init token as null
    let data = ctx.request.body;
    let user = data.user
    if (user!=undefined || user!=null){
        try {
            let out = null;
            let email = user.email;
            let password = user.password;
            if ((email!=null || email!=undefined ) && (password!=null || password!=undefined)){
            let res =await db.findUserByEmail(email)
                if(res){ // to-do check if activated

                 /* await bcrypt.compare(password, res.password,function(err, result){
                        const isPwdMatched = result;
                        if(isPwdMatched){
                            // asgin token
                            const payload = {
                                                id:res.id,
                                        username:res.username,
                                            email:res.email
                                            }
                            let token = asignToken(payload, JWT_SECRET, "6h");
                            out = {
                                user: payload,
                                token: token,
                                status: "OK"
                            }
                            ctx.body = out;
                            console.log("out ",out);
                        }
                    });
                    */
                   
                //to-do : async not work, need to fix
                const isPwdMatched = bcrypt.compareSync(password,res.password)
                if(isPwdMatched && res.isActivated){
                    // asgin token
                    const payload = {
                                        id:res.id,
                                username:res.username,
                                    email:res.email
                                    }
                    let token = asignToken(payload, JWT_SECRET, "6h");
                    out = {
                        user: payload,
                        token: token,
                        status: "OK"
                    }
                    ctx.body = out;
                    }
                    else if (isPwdMatched){
                        let token = jwt.sign({
                            user:{
                                id: res.id,
                                username: res.username,
                                firstname: res.firstname,
                                lastname: res.lastname,
                                email: res.email
                            }   
                        },JWT_SECRET);

                        ctx.body = {
                            error: "User is not activated",
                            reActivation: 'http://' + ctx.host + router.url('activation', token), 
                            status: "error"
                        }
                    } else {
                        ctx.body = {
                            error: "User is not registed",
                            status: "error"
                        } 
                    } 
                }
            }
        } catch (error) {
            ctx.body =  {
                error: "JWT cannot be assigned",
                status: "error"
            }
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

async function activateUser(ctx){
    let token = ctx.params.token
    if (token){
        try {
            let decoded = jwt.verify(token, JWT_SECRET);
            let email = decoded.user.email
            let result = await db.activateUser(email)
            ctx.body = {
                user: {
                    id: result.id,
                    username:result.username,
                    firstname:result.firstname,
                    lastname: result.lastname,
                    email: result.email,
                    isActivated: result.isActivated,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                },
                status: "activated"
            }
        } catch (error) {
            ctx.body = {
                error: "invalid token"
            }
        }
    }

}

function asignToken(user,secret,expiresIn='1h'){
    let token = jwt.sign(user, secret, {expiresIn:expiresIn});
    return token;
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

