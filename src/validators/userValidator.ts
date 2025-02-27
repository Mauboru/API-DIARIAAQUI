import { Request, Response, NextFunction } from 'express';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { parsePhoneNumber } from 'libphonenumber-js';

export const validateUserData = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone_number, cpforCnpj } = req.body;

  if (!name || !email || !password || !cpforCnpj || !phone_number) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  if (!(cpf.isValid(cpforCnpj) || cnpj.isValid(cpforCnpj))) {
    return res.status(400).json({ message: 'CPF ou CNPJ inválido.' });
  }

  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  try {
    const phonePattern = parsePhoneNumber(phone_number, 'BR');
    if (!phonePattern.isValid()) {
      return res.status(400).json({ message: 'Número de telefone inválido.' });
    }
  } catch (err) {
    return res.status(400).json({ message: 'Número de telefone inválido.' });
  }

  const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/;
  if (!passwordPattern.test(password)) {
    return res.status(400).json({ message: 'Senha muito fraca! A senha deve ter entre 8 e 20 caracteres, incluir letras maiúsculas e minúsculas, um número e um caractere especial.' });
  }

  next();
};