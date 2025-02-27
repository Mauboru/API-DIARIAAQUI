import jwt from 'jsonwebtoken';

export const generateToken = (payload: object, expiresIn: string = '30d'): string => {
  return jwt.sign(payload, 'chave_secreta', { expiresIn: '30d' });
};

export const verifyToken = (token: string): any | null => {
  try {
    return jwt.verify(token, 'chave_secreta');
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return null;
  }
};
