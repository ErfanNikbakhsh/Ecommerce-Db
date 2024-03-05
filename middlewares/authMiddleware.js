const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const asynchandler = require('express-async-handler');
const fse = require('fs-extra');
const path = require('path');
const handlebars = require('handlebars');
const { logMiddleware, hashToken, requestLimiter } = require('../utils/Api-Features');
const { sendEmail } = require('../utils/email');
const { generateRefreshToken, generateToken } = require('../config/jwtToken');

const auth = asynchandler(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(decoded.userId).exec();
        req.user = user;
        logMiddleware('auth');
        next();
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token Expired. Please Login Again.' });
      } else {
        return res.status(401).json({ message: 'Not Authorized, Please Login Again' });
      }
    }
  } else {
    throw new Error('There Is No Token Attached!');
  }
});

const refreshToken = asynchandler(async (req, res, next) => {
  const enteredRefreshToken = req.cookies.refreshToken;
  const hashedEnteredRefToken = hashToken(enteredRefreshToken);

  if (enteredRefreshToken) {
    try {
      const user = await User.findOne({ 'refreshTokens.token': hashedEnteredRefToken }).exec();

      // Detected refresh token reuse!
      if (!user) {
        const decoded = jwt.verify(enteredRefreshToken, process.env.REF_SECRET_KEY);

        // Find the hackedUser and delete all refresh tokens
        await User.findByIdAndUpdate(decoded?.userId, { refreshTokens: [] });
        return res.status(403).json({ message: 'Access denied, Please login again!' });
      }

      // Remove the used refresh token and update DB
      const newRefTokenArray = user.refreshTokens.filter(
        (rt) => rt.token !== hashedEnteredRefToken
      );
      user.refreshTokens = newRefTokenArray;
      await user.save();

      // Evaluate refresh token
      jwt.verify(enteredRefreshToken, process.env.REF_SECRET_KEY);

      // Generate the new tokens and add RF to the Db
      const newAccessToken = generateToken(user._id);
      const newRefToken = generateRefreshToken(user._id);
      const refreshTokenExp = jwt.verify(newRefToken, process.env.REF_SECRET_KEY).exp;
      const hashedRefToken = hashToken(newRefToken);

      user.refreshTokens.push({ token: hashedRefToken, expiresAt: refreshTokenExp });
      await user.save();

      res.status(200).json({
        access: newAccessToken,
        refresh: newRefToken,
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Refresh Token Expired. Please Login Again.' });
      } else {
        next(error);
      }
    }
  } else {
    throw new Error('There Is No Refresh Token Attached!');
  }
});

const isAdmin = asynchandler(async (req, res, next) => {
  const { role } = req.user;
  if (role !== 'admin') {
    throw new Error('you are not an admin');
  } else {
    logMiddleware('isAdmin');
    next();
  }
});

const updatePassword = asynchandler(async (req, res, next) => {
  const { user } = req;
  const { oldPass, newPass, confirmNewPass } = req.body;

  try {
    if (!(await user.isPasswordMatched(oldPass))) {
      throw new Error('Invalid Credentials');
    }

    if (newPass && confirmNewPass) {
      if (newPass !== confirmNewPass) {
        return res
          .status(400)
          .json({ message: `New password and confirm password doesn't match!` });
      }
    } else {
      return res.status(400).json({ message: 'New password and confirm password is required' });
    }

    user.password = newPass;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

const forgotPassword = asynchandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User Not Found!');
  }

  // Generate a random resetToken
  const resetToken = user.genResetToken();
  await user.save();

  // Set the reset password form url (This is a url that shows the form for resetting the password when the user clicks on it.)
  const resetUrl = `${req.protocol}://${req.get('host')}/api/user/passwordResetForm/${resetToken}`;
  const message = `We have received a password reset request. Please use the below link to reset your password\n\n ${resetUrl}\n\nThis reset password link will be valid only for 10 minutes.`;

  const emailTemplatePath = path.join(__dirname, '../public/templates/email.html');

  // Read the content of the email template file
  const readFile = async (filePath) => {
    try {
      return await fse.readFile(filePath, 'utf-8');
    } catch (error) {
      console.log('Error reading file:', error);
      throw error;
    }
  };

  const emailTemplate = await readFile(emailTemplatePath);

  // Replace the placeholders
  const compiledTemplate = handlebars.compile(emailTemplate);
  const replacements = {
    resetUrl: resetUrl,
  };

  const htmlToSend = compiledTemplate(replacements);

  // Send the email
  try {
    // Why do we need the await keyword when calling sendEmail function?
    await sendEmail({
      email: user.email,
      subject: 'Password change request received',
      message: message,
      htmlToSend: htmlToSend,
    });

    res.status(200).send(`Password reset link sent to the user's email`);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    console.log(error);
    throw new Error('There was an error sending password reset email. Please try again later');
  }
});

const validateResetToken = asynchandler(async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = hashToken(token);

    const user = await User.findOne()
      .where({ passwordResetToken: hashedToken })
      .where('passwordResetTokenExpires')
      .gt(Date.now());

    if (!user) {
      throw new Error('Token is invalid or has expired!');
    }

    res.status(200).send('Token is valid');
  } catch (error) {
    next(error);
  }
});

const resetPassword = asynchandler(async (req, res, next) => {
  try {
    const { newPass, confirmNewPass } = req.body;
    const { token } = req.params;
    const hashedToken = hashToken(token);

    const user = await User.findOne()
      .where({ passwordResetToken: hashedToken })
      .where('passwordResetTokenExpires')
      .gt(Date.now());

    if (!user) {
      throw new Error('Token is invalid or has expired!');
    }

    if (newPass !== confirmNewPass) {
      throw new Error(`Password and confirm password doesn't match!`);
    }

    // Resetting the password
    user.password = newPass;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    //user.passwordChangedAt = Date.now() // I don't get it why do we need this field.

    // Login the user
    const refreshToken = generateRefreshToken(user?._id);
    const refreshTokenExp = jwt.verify(refreshToken, process.env.REF_SECRET_KEY).exp * 1000;
    const hashedRefToken = hashToken(refreshToken);

    user.refreshTokens.push({ token: hashedRefToken, expiresAt: refreshTokenExp });
    await user.save();

    res.status(200).json({
      id: user?._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      mobile: user?.mobile,
      access: generateToken(user?._id),
      refresh: refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = {
  auth,
  isAdmin,
  refreshToken,
  updatePassword,
  forgotPassword,
  resetPassword,
  validateResetToken,
};
