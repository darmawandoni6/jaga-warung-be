import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { env } from '@/config/env';
import prisma from '@/config/prisma';
import { RegisterInput, LoginInput } from '@/schemas/auth.schema';

const SALT_ROUNDS = 10;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const sanitizeUser = (user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserResponse => ({
  id: user.id,
  email: user.email,
  name: user.name,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const generateTokens = (payload: { id: string; email: string }): AuthTokens => {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
};

export const register = async (
  input: RegisterInput
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw createHttpError.Conflict('Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      email: input.email,
      password: hashedPassword,
      name: input.name ?? null,
    },
  });

  const tokens = generateTokens({ id: newUser.id, email: newUser.email });

  return {
    user: sanitizeUser(newUser),
    tokens,
  };
};

export const login = async (
  input: LoginInput
): Promise<{ user: UserResponse; tokens: AuthTokens }> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw createHttpError.Unauthorized('Invalid email or password');
  }

  const isPasswordMatch = await bcrypt.compare(input.password, user.password);
  if (!isPasswordMatch) {
    throw createHttpError.Unauthorized('Invalid email or password');
  }

  const tokens = generateTokens({ id: user.id, email: user.email });

  return {
    user: sanitizeUser(user),
    tokens,
  };
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string }> => {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      id: string;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      throw createHttpError.Unauthorized('User not found or deactivated');
    }

    const newAccessToken = jwt.sign({ id: user.id, email: user.email }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return { accessToken: newAccessToken };
  } catch (err: unknown) {
    if (createHttpError.isHttpError(err)) throw err;
    throw createHttpError.Unauthorized('Invalid or expired refresh token');
  }
};

export const getProfile = async (userId: string): Promise<UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw createHttpError.NotFound('User not found');
  }

  return sanitizeUser(user);
};
