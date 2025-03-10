import Joi from 'joi';

export const signupSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(60)
    .required()
    .email({
      tlds: { allow: ['com', 'net'] },
    }),
  password: Joi.string()
    .required()
    .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(60)
    .required()
    .email({
      tlds: { allow: ['com', 'net'] },
    }),
  password: Joi.string()
    .required()
    .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)),
});

// export default {signupSchema, loginSchema}
