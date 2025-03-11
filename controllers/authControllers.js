import {
  signupSchema,
  loginSchema,
  acceptCodeSchema,
  changePasswordSchema,
  forgotPasswordCodeSchema,
} from '../middlewares/validator.js';
import User from '../models/userModel.js';
import { doHash, validateUser } from '../utils/hashing.js';
import jwt from 'jsonwebtoken';
import transport from '../utils/sendEmail.js';
import { hmacProcess } from '../utils/hashing.js';

export async function signup(req, res) {
  const { email, password } = req.body;
  try {
    const { error, value } = signupSchema.validate({ email, password });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      res.status(401).json({ message: 'User already exists' });
    } else {
      const hashedPassword = await doHash(password, 12);

      const newUser = new User({ email, password: hashedPassword });
      const result = await newUser.save();
      result.password = undefined;
      res.status(201).json({
        success: true,
        message: 'Your account has been created succesfully.....',
        result,
      });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { error, value } = await loginSchema.validate({ email, password });
    if (error) {
      res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email: email }).select(
      '+password'
    );

    if (!existingUser) {
      res
        .status(401)
        .json({ success: false, message: 'User does not exist ...' });
    }

    const validateUserResult = await validateUser(
      password,
      existingUser.password
    );

    if (!validateUserResult) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res
      .cookie('Authorization', 'Bearer' + token, {
        expires: new Date(Date.now() + 1 * 3600000),
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
      })
      .json({
        success: true,
        token,
        message: 'logged in successfully...',
      });
  } catch (error) {
    console.log(error);
  }
}

export async function logout(req, res) {
  res
    .clearCookie('Authorization')
    .status(200)
    .json({ success: true, message: 'Logged out successfully....' });
}

export async function sendVerificationCode(req, res) {
  const email = req.body.email;

  const existingUser = await User.findOne({ email: email });
  console.log(existingUser);
  if (!existingUser) {
    res
      .status(401)
      .json({ success: false, message: 'User does not exist ...' });
  }

  if (existingUser.verified) {
    res
      .status(401)
      .json({ success: false, message: 'You are already verified...' });
  }

  const verificationCode = Math.floor(Math.random() * 1000000).toString();

  const info = await transport.sendMail({
    from: process.env.SENDER_EMAIL_ADDRESS,
    to: existingUser.email,
    subject: 'Verification code',
    html: '<h3>' + verificationCode + '</h3>',
  });

  if (info.accepted[0] === existingUser.email) {
    const hashedValue = hmacProcess(
      verificationCode,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );
    existingUser.verificationCode = hashedValue;
    existingUser.verificationCodeValidation = Date.now();
    await existingUser.save();
    return res
      .status(200)
      .json({ success: true, message: 'Code Sent Successfully... ' });
  }
  return res.status(400).json({
    success: falsel,
    message: 'Could not send the verification code...',
  });
}

export async function verifyVerificationCode(req, res) {
  const { email, providedCode } = req.body;
  try {
    const { error, value } = acceptCodeSchema.validate({ email, providedCode });

    if (error) {
      res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const providedCodeString = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      '+verificationCode +verificationCodeValidation'
    );

    if (!existingUser) {
      res
        .status(401)
        .json({ success: false, message: 'User does not exist ...' });
    }
    if (existingUser.verified) {
      res
        .status(401)
        .json({ success: false, message: 'You are already verified...' });
    }
    if (
      !existingUser.verifyVerificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      res
        .status(401)
        .json({ success: false, message: 'Something went wrong...' });
    }
    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      res.status(400).json({ success: false, message: 'Code has expired...' });
    }

    const hashcodeValue = hmacProcess(
      providedCodeString,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashcodeValue == existingUser.verificationCode) {
      existingUser.verified = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;
      await existingUser.save();
      res
        .status(200)
        .json({ success: true, message: 'Your account has been verified' });
    } else {
      res
        .status(401)
        .json({ success: false, message: 'Something unexpected happened' });
    }
  } catch (error) {
    console.log(error);
  }
}

export async function changePassword(req, res) {
  const { userId, verified } = req.user;
  const { oldPassword, newPassword } = req.body;
  try {
    const { error, value } = await changePasswordSchema.validate({
      oldPassword,
      newPassword,
    });

    if (error) {
      res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    if (!verified) {
      res.status(401).json({ success: false, message: 'You are not verified' });
    }

    const existingUser = await User.findOne({ _id: userId }).select(
      '+password'
    );
    if (!existingUser) {
      res
        .status(401)
        .json({ success: false, message: 'User does not exist ...' });
    }

    const result = await validateUser(oldPassword, existingUser.password);
    if (!result) {
      res
        .status(401)
        .json({ success: false, message: 'Incorrect old password' });
    }

    const hashedPassword = await doHash(newPassword, 12);
    existingUser.password = hashedPassword;
    await existingUser.save();
    res
      .status(200)
      .json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.log(error);
  }
}

export async function sendForgotPasswordCode(req, res) {
  const email = req.body.email;

  const existingUser = await User.findOne({ email: email });
  console.log(existingUser);
  if (!existingUser) {
    res
      .status(401)
      .json({ success: false, message: 'User does not exist ...' });
  }

  const verificationCode = Math.floor(Math.random() * 1000000).toString();

  const info = await transport.sendMail({
    from: process.env.SENDER_EMAIL_ADDRESS,
    to: existingUser.email,
    subject: 'Verification code',
    html: '<h3>' + verificationCode + '</h3>',
  });

  if (info.accepted[0] === existingUser.email) {
    const hashedValue = hmacProcess(
      verificationCode,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );
    existingUser.forgotPasswordCode = hashedValue;
    existingUser.forgotPasswordCodeValidation = Date.now();
    await existingUser.save();
    return res
      .status(200)
      .json({ success: true, message: 'Code Sent Successfully... ' });
  }
  return res.status(400).json({
    success: false,
    message: 'Could not send the verification code...',
  });
}

export async function verifyForgotPasswordCode(req, res) {
  const { email, providedCode, newPassword } = req.body;
  try {
    const { error, value } = forgotPasswordCodeSchema.validate({
      email,
      providedCode,
      newPassword,
    });

    if (error) {
      res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const providedCodeString = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      '+forgotPasswordCode +forgotPasswordCodeValidation'
    );

    if (!existingUser) {
      res
        .status(401)
        .json({ success: false, message: 'User does not exist ...' });
    }

    if (
      !existingUser.forgotPasswordCode ||
      !existingUser.forgotPasswordCodeValidation
    ) {
      res
        .status(401)
        .json({ success: false, message: 'Something went wrong...' });
    }
    if (
      Date.now() - existingUser.forgotPasswordCodeValidation >
      5 * 60 * 1000
    ) {
      res.status(400).json({ success: false, message: 'Code has expired...' });
    }

    const hashcodeValue = hmacProcess(
      providedCodeString,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if (hashcodeValue == existingUser.forgotPasswordCode) {
      existingUser.forgotPasswordCode = undefined;
      existingUser.forgotPasswordCodeValidation = undefined;
      const hashedPassword = await doHash(newPassword, 12);
      existingUser.password = hashedPassword;
      await existingUser.save();
      res.status(200).json({
        success: true,
        message: 'Your password has been changed successfully....',
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: 'Something unexpected happened' });
    }
  } catch (error) {
    console.log(error);
  }
}
