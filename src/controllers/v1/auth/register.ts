//custom modules
import { logger } from '@/lib/winston';
import config from '@/config';
import { getUsername } from '@/utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';

//models
import User from '@/models/user';
import Token from '@/models/token';

//types
import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';

type UserData = Pick<IUser, 'email' | 'password' | 'role'>;

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role }: UserData = req.body;

  if (role === 'admin' && !config.WHITELIST_ADMINS_MAIL.includes(email)) {
    res.status(403).json({
      error: 'AuthorizationError',
      message: 'You are not authorized to register as an admin.',
    });
    logger.warn(`Unauthorized admin registration attempt`, {
      email,
    });
    return;
  }

  try {
    const username = getUsername();
    const newUser = await User.create({
      username,
      email,
      password,
      role,
    });

    //generate access token and refresh token
    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    //store refresh token in the database
    await Token.create({
      userId: newUser._id,
      token: refreshToken,
    });
    logger.info(`Refresh token created for user`, {
      userId: newUser._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict', // prevent CSRF attacks
    });

    res.status(201).json({
      user: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken,
    });
    logger.info(`User registered successfully`, {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    logger.error(`Error registering user: ${error}`);
    res
      .status(500)
      .json({ code: 'Server Error', message: 'Internal Server Error', error });
    logger.error(`Error during user registration`, error);
  }
};

export default register;
