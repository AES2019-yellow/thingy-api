/*
 * File: /models/pressure.js
 * Project: thingy-api-yellow
 * File Created: Sun, 3rd November 2019 4:08:39 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const Sequelize = require('sequelize');


module.exports = sequelize => {
    const Pressure = sequelize.define('pressure',{

        pressure: {
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
    

    return Pressure;
};