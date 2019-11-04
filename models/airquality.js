/*
 * File: /models/airquality.js
 * Project: thingy-api-yellow
 * File Created: Sun, 3rd November 2019 4:10:44 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const Sequelize = require('sequelize');
const Device = require('./device')

module.exports = sequelize => {
    const AirQuality = sequelize.define('airquality',{

        co2: {
            type: Sequelize.NUMBER,
            allowNull: false
        },
        tvoc: {
            type: Sequelize.NUMBER,
            allowNull: false
        },
        from:{
            type: Sequelize.STRING,
            allowNull: false
        },
        to: {
            type: Sequelize.STRING,
            allowNull: false 
        }
    });

    return AirQuality;
};