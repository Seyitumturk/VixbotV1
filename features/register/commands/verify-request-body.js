const Joi = require('joi');
const User = require('../../../models/Users');

const schema = Joi.object().keys({
  name: Joi.string()
    .min(1)
    .max(60)
    .required(),
  password: Joi.string()
    .min(6)
    .max(30),
  email: Joi.string().email({ minDomainSegments: 2 }),
});

async function validateRegisterPayload(req, res, next) {
  let payloadValidation;
  try {
    payloadValidation = await schema.validateAsync(req.body, { abortEarly: false });
  } catch (error) {
    payloadValidation = error;
  }

  let errors;
  if (payloadValidation.details) {
    errors = {};
    payloadValidation.details.forEach((errorDetail) => {
      const { path: [key], type } = errorDetail;
      const errorType = type.split('.')[1];
      errors[key] = User.getValidationErrorMessage(key, errorType);
    });
  }

  if (errors) {
    req.session.messages = { errors };
    return res.status(400).redirect('/register');
  }

  return next();
}

module.exports = validateRegisterPayload;
