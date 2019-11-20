const Joi = require('@hapi/joi');

const userRegSchema = Joi.object({
    username: Joi.string()
    .alphanum()
    .min(3)
    .max(64)
    .required(),

    firstname: Joi.string()
    .pattern(/^[a-zA-Z]{3,30}$/)
    .required(),
   
    lastname: Joi.string()
    .pattern(/^[a-zA-Z]{3,30}$/)
    .required(),

    // strong password at least 1 caps,1 lower,1 num,1 special char
    password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{6,18}$/)
    .required(),

    repeat_password: Joi.ref('password'),

    email: Joi.string()
    .email({ minDomainSegments: 2})
    .required()
})

const userUpdateSchema = Joi.object({

    firstname: Joi.string()
    .pattern(/^[a-zA-Z]{3,30}$/)
    .optional(),
   
    lastname: Joi.string()
    .pattern(/^[a-zA-Z]{3,30}$/)
    .optional(),

    // strong password at least 1 caps,1 lower,1 num,1 special char
    password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#$^+=!*()@%&]).{6,18}$/)
    .optional(),

    repeat_password: Joi.ref('password'),

    email: Joi.string()
    .email({ minDomainSegments: 2})
    .required()
}).with('password','repeat_password')

const schema = {
    userRegSchema: userRegSchema,
    userUpdateSchema: userUpdateSchema
}

module.exports = schema