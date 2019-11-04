/*
 * File: /models/temperature.js
 * Project: thingy-api-yellow
 * File Created: Sun, 3rd November 2019 2:47:02 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const Sequelize = require('sequelize');

module.exports = sequelize => {
    const Temperature = sequelize.define('temperature',{

        temperature: {
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
    
    return Temperature;
};