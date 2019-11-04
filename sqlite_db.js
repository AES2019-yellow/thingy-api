/*
 * File: /sqlite_db.js
 * Project: thingy-api-yellow
 * File Created: Sun, 3rd November 2019 2:35:47 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

'use strict'

const Sequelize = require('sequelize');
// const sqlite = require('sqlite3');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/thingyApiDB.sqlite3'
})

const db = {};

// db.Sequelize = Sequelize;
// db.sequelize = sequelize;

db.Device = require('./models/device')(sequelize);
db.Temperature = require('./models/temperature')(sequelize);
db.Pressure = require('./models/pressure')(sequelize);
db.Humidity = require('./models/humidity')(sequelize);
db.AirQuality = require('./models/airquality')(sequelize);

db.Device.hasMany(db.Temperature);
db.Temperature.belongsTo(db.Device);

db.Device.hasMany(db.Humidity);
db.Humidity.belongsTo(db.Device);

db.Device.hasMany(db.AirQuality);
db.AirQuality.belongsTo(db.Device);

db.Device.hasMany(db.Pressure);
db.Pressure.belongsTo(db.Device);


db.createSchema = function () {
    sequelize
        .authenticate()
        .then(async ()=>{
            console.log('Connection has been established successfully.')
            sequelize.sync({
                force: true
            }).then(async ()=>{
                console.log(`Database & tables created!`);
            })
        })
        .catch(err=>{
            console.log('Unable to connect to the database: ', err)
        });

}

/* If necessary to re-init the db */
// createSchema()

db.saveTemperatureByDeviceName = async function (device_name,data){
    console.log("data: ",data)
    let device = await db.Device.findOne({
        where: {device_name: device_name}
    }).then(async device=>{
            if (device != null && device.get('device_name')==device_name){
                console.log("found device")
            } else {
                device = await db.Device.create({device_name:device_name});
            }
            let temperature = await db.Temperature.create({
                temperature:data.means[0],
                       from:data.from,
                         to:data.to});
            await device.addTemperature(temperature).then((res,err)=>{
                if (!err){
                    console.log("adTemperature ",data," succeed!");
                }
            });
            
       });
}

db.savePressureByDeviceName = async function (device_name,data){
    let device = await db.Device.findOne({
        where: {device_name: device_name}
    }).then(async device=>{
            if (device != null && device.get('device_name')==device_name){
                console.log("found device")
            } else {
                device = await db.Device.create({device_name:device_name});
            }
            let pressure = await db.Pressure.create({
                pressure:data.means[0],
                    from:data.from,
                      to:data.to});
            await device.addPressure(pressure).then((res,err)=>{
                if (!err){
                    console.log("addPressure ",data," succeed!");
                }
            });
            
       });
}

db.saveHumidityByDeviceName = async function (device_name,data){
    let device = await db.Device.findOne({
        where: {device_name: device_name}
    }).then(async device=>{
            if (device != null && device.get('device_name')==device_name){
                console.log("found device")
            } else {
                device = await db.Device.create({device_name:device_name});
            }
            let humidity = await db.Humidity.create({
                humidity:data.means[0],
                    from:data.from,
                      to:data.to});
            await device.addHumidity(humidity).then((res,err)=>{
                if (!err){
                    console.log("addHumidity ",data," succeed!");
                }
            });
            
       });
}

db.saveAirQualityByDeviceName = async function (device_name,data){
    let device = await db.Device.findOne({
        where: {device_name: device_name}
    }).then(async device=>{
            if (device != null && device.get('device_name')==device_name){
                console.log("found device")
            } else {
                device = await db.Device.create({device_name:device_name});
            }
            let airquality = await db.AirQuality.create({
                     co2:data.means[0],
                    tvoc:data.means[1],
                    from:data.from,
                      to:data.to});
            await device.addAirquality(airquality).then((res,err)=>{
                if (!err){
                    console.log("addAirquality ",data," succeed!");
                }
            });
            
       });
}

/*
db.findByDate = async function (date){

}
*/



/**
 * Uncomment the line below, if a new db file needs to be migrated.
 */
// db.createSchema()

module.exports = db;