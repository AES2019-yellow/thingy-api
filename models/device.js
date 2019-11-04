/*
 * File: /models/device.js
 * Project: thingy-api-yellow
 * File Created: Sun, 3rd November 2019 2:43:42 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */


const Sequelize = require('sequelize');

module.exports = sequelize => {
    const Device = sequelize.define('device',{
        device_name: {
            type: Sequelize.CHAR(64),
            allowNull: false,
            
        }
    });

    return Device;
};
