import { Request, Response, NextFunction } from 'express';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { parsePhoneNumber } from 'libphonenumber-js';


const isValidCpfOrCnpj = (value: string): boolean => {
  return cpf.isValid(value) || cnpj.isValid(value);
};

const isValidEmail = (email: string): boolean => {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailPattern.test(email);
};

const isValidPassword = (password: string): boolean => {
  const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/;
  return passwordPattern.test(password);
};

export const validateUserData = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone_number, cpf_or_cnpj } = req.body;

  if (!name || !email || !password || !cpf_or_cnpj || !phone_number) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  if (!isValidCpfOrCnpj(cpf_or_cnpj)) {
    return res.status(400).json({ message: 'CPF ou CNPJ inválido.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  try {
    const phone = parsePhoneNumber(phone_number, 'BR');
    if (!phone?.isValid()) {
      return res.status(400).json({ message: 'Número de telefone inválido.' });
    }
  } catch (err) {
    return res.status(400).json({ message: 'Número de telefone inválido.' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      message: 'Senha muito fraca! A senha deve ter entre 8 e 20 caracteres, incluir letras maiúsculas e minúsculas, um número e um caractere especial.',
    });
  }
  next();
};

export const validateLoginData = (req: Request, res: Response, next: NextFunction) => {
  const { cpf_or_cnpj_or_email, password } = req.body;

  if (!cpf_or_cnpj_or_email || !password) {
    return res.status(400).json({ message: 'CPF/CNPJ, email e senha são obrigatórios.' });
  }

  if (typeof cpf_or_cnpj_or_email !== 'string' || cpf_or_cnpj_or_email.trim() === '') {
    return res.status(400).json({ message: 'CPF/CNPJ ou email inválido.' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Senha inválida. A senha deve ter pelo menos 8 caracteres.' });
  }
  next();
};

export const validateUpdateUserData = (req: Request, res: Response, next: NextFunction) => {
  const { email, phone_number, cpf_or_cnpj } = req.body;

  if (cpf_or_cnpj && !isValidCpfOrCnpj(cpf_or_cnpj)) {
    return res.status(400).json({ message: 'CPF ou CNPJ inválido.' });
  }

  if (email && !isValidEmail(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  if (phone_number) {
    try {
      const phone = parsePhoneNumber(phone_number, 'BR');
      if (!phone?.isValid()) {
        return res.status(400).json({ message: 'Número de telefone inválido.' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Número de telefone inválido.' });
    }
  }
  next();
};
