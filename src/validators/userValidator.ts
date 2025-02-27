import { Request, Response, NextFunction } from 'express';
import { cpf, cnpj } from 'cpf-cnpj-validator';
import { parsePhoneNumber } from 'libphonenumber-js';

export const validateUserData = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, phone_number, cpf_or_cnpj } = req.body;

  if (!name || !email || !password || !cpf_or_cnpj || !phone_number) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  if (!(cpf.isValid(cpf_or_cnpj) || cnpj.isValid(cpf_or_cnpj))) {
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

export const validateLoginData = (req: Request, res: Response, next: NextFunction) => {
  const { cpf_or_cnpj_or_email, password } = req.body;

  if (!cpf_or_cnpj_or_email || !password) {
    return res.status(400).json({ message: 'CPF/CNPJ, email e senha são obrigatórios.' });
  }

  if (typeof cpf_or_cnpj_or_email !== 'string' || cpf_or_cnpj_or_email.trim() === '') {
    return res.status(400).json({ message: 'CPF/CNPJ ou eamil inválido.' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Senha inválida. A senha deve ter pelo menos 8 caracteres.' });
  }

  next();
};