import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'sua_chave_secreta';

export const generateToken = (payload: object, expiresIn: string = '30d'): string => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

export const verifyToken = (token: string): any | null => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};