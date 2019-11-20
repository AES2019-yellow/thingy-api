/*
 * File: /models/user.js
 * Project: thingy-api-yellow
 * File Created: Tue, 19th November 2019 1:00:46 pm
 * Author: Yi Zhang (yi.zhang@unifr.ch)
 * -----
 * Copyright 2019 - 2019 AES-Unifr, AES2019-Yellow
 */

const Sequelize = require('sequelize');

module.exports = sequelize => {
    const User = sequelize.define('user',{

        username: {
            type: Sequelize.STRING,
            allowNull: false,
            validate:{
                len : [3, 64],
            }
            
        },
        firstname: {
            type: Sequelize.STRING,
            allowNull: false,
            validate:{
                len : [3, 64],
            }
        },
        lastname: {
            type: Sequelize.STRING,
            allowNull: false,
            validate:{
                len : [3, 64],
            }
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            validate:{
                isEmail: true,
            }
        },

        password:{
            type: Sequelize.STRING,
            allowNull: false
        },

        isActivated:{
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    });

    return User;
};