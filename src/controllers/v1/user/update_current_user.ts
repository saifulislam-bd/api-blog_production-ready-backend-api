//custom modules
import { logger } from '@/lib/winston';

//models
import User from '@/models/user';

//types
import type { Request, Response } from 'express';

const updateCurrentUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.userId;

  const {
    username,
    email,
    password,
    firstName,
    lastName,
    website,
    facebook,
    instagram,
    linkedin,
    github,
    x,
    youtube,
  } = req.body;

  try {
    const user = await User.findById(userId).select('+password -__v').exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    if (!user.socialLinks) user.socialLinks = {};

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (website) user.socialLinks.website = website;
    if (facebook) user.socialLinks.facebook = facebook;
    if (instagram) user.socialLinks.instagram = instagram;
    if (linkedin) user.socialLinks.linkedin = linkedin;
    if (github) user.socialLinks.github = github;
    if (x) user.socialLinks.x = x;
    if (youtube) user.socialLinks.youtube = youtube;

    await user.save();
    res.status(200).json({
      message: 'User updated successfully',
      user,
    });
    logger.info(`User info updated successfully`, user);
  } catch (error) {
    res.status(500).json({
      code: 'ServerError',
      message: 'Internal Server Error',
      error,
    });
    logger.error(`Error during updating current user`, error);
  }
};

export default updateCurrentUser;
