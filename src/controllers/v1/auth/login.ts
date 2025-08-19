//node modules
import bcrypt from 'bcrypt';

//custom modules
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import config from '@/config';

//models
import User from '@/models/user';
import Token from '@/models/token';

//types
import type { Request, Response } from 'express';
import type { IUser } from '@/models/user';

type UserData = Pick<IUser, 'email' | 'password'>;

const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as UserData;

    const user = await User.findOne({ email })
      .select('username email password role')
      .lean()
      .exec();

    if (!user) {
      res.status(404).json({
        code: 'NotFound',
        message: 'User not found',
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({
        code: 'Unauthorized',
        message: 'Invalid email or password',
      });
      return;
    }

    //generate access token and refresh token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    //store refresh token in the database
    await Token.create({
      userId: user._id,
      token: refreshToken,
    });
    logger.info(`Refresh token created for user`, {
      userId: user._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict', // prevent CSRF attacks
    });

    res.status(201).json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
    logger.info(`User logged in successfully`, user);
  } catch (error) {
    logger.error(`Error login user: ${error}`);
    res
      .status(500)
      .json({ code: 'Server Error', message: 'Internal Server Error', error });
    logger.error(`Error during user login`, error);
  }
};

export default login;
