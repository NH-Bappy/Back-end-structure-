const Joi = require('joi');


const userValidationSchema = Joi.object({
    email:Joi.string().trim().required()
})