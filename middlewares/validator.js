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

export const acceptCodeSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(60)
    .required()
    .email({
      tlds: { allow: ['com', 'net'] },
    }),
  providedCode: Joi.number().required(),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)),

  newPassword: Joi.string()
    .required()
    .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/))
});
// export default {signupSchema, loginSchema}


export const forgotPasswordCodeSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(60)
    .required()
    .email({
      tlds: { allow: ['com', 'net'] },
    }),
  newPassword: Joi.string()
    .required()
    .pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)),
  providedCode: Joi.number().required(),
});

export const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(60).required(),
  description: Joi.string().min(3).max(600).required(),
  userId: Joi.string().required(),
});