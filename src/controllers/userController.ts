import { Request, Response } from 'express';
import { User } from '../models/User';
import { Op } from 'sequelize';
const { cpf, cnpj } = require('cpf-cnpj-validator');
import { parsePhoneNumber } from 'libphonenumber-js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { emailOrName, password } = req.body;

    if (!emailOrName || !password) {
      return res.status(400).json({ message: 'Email/Usuario e senha são obrigatórios.' });
    }

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ email: emailOrName }, { name: emailOrName }] 
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(404).json({ message: 'Senha incorreta.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      'sua_chave_secreta',
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      message: 'Login bem-sucedido.',
      token: token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const registerUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, password, phone_number, cpforCnpj } = req.body;

    if (!name || !email || !password || !cpforCnpj || !phone_number) return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });

    if (cpf.isValid(cpforCnpj) || cnpj.isValid(cpforCnpj)) {
    } else {
      return res.status(400).json({ message: 'CPF ou CNPJ inválido.' });
    }

    const existingCpfOrCnpj = await User.findOne({ where: { cpforCnpj } });
    if (existingCpfOrCnpj) return res.status(400).json({ message: 'Este cpf/cnpj já está registrado.' });

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(email)) return res.status(400).json({ message: 'Email inválido.' });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Este e-mail já está registrado.' });

    try {
      const phonePattern = parsePhoneNumber(phone_number, 'BR');
      if (!phonePattern.isValid()) {
        return res.status(400).json({ message: 'Número de telefone inválido.' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Número de telefone inválido.' });
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/;
    if (!passwordPattern.test(password)) return res.status(400).json({ message: 'Senha muito fraca!' })

    const password_hash = await bcrypt.hash(password, 10);

    const randomImageIndex = Math.floor(Math.random() * 10) + 1;

    const newUser = await User.create({
      name,
      email,
      password_hash,
      phone_number,
      cpforCnpj,  
      profileImage: randomImageIndex,
    });

    await client.messages.create({
      body: `Novo cadastro: ${newUser.name} (${newUser.email}) com o CPF/CNPJ ${newUser.cpforCnpj}`,
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+554184987049',
    });

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error('Erro no cadastro do usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getUserData = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token ausente.' });
    }

    const decoded: any = jwt.verify(token, 'sua_chave_secreta');
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const { password_hash, id, createdAt, updatedAt, ...userData } = user.toJSON();

    return res.status(200).json(userData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token ausente.' });
    }

    const decoded: any = jwt.verify(token, 'sua_chave_secreta');
    const userId = decoded.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const { name, email, phone_number, cpforCnpj } = req.body;

    if (cpforCnpj && !(cpf.isValid(cpforCnpj) || cnpj.isValid(cpforCnpj))) {
      return res.status(400).json({ message: 'CPF ou CNPJ inválido.' });
    }

    if (cpforCnpj && cpforCnpj !== user.cpforCnpj) {
      const existingCpfOrCnpj = await User.findOne({ where: { cpforCnpj } });
      if (existingCpfOrCnpj) {
        return res.status(400).json({ message: 'Este CPF/CNPJ já está registrado.' });
      }
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (email && !emailPattern.test(email)) {
      return res.status(400).json({ message: 'Email inválido.' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Este email já está registrado.' });
      }
    }

    if (phone_number) {
      try {
        const phonePattern = parsePhoneNumber(phone_number, 'BR');
        if (!phonePattern.isValid()) {
          return res.status(400).json({ message: 'Número de telefone inválido.' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Número de telefone inválido.' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone_number = phone_number || user.phone_number;
    user.cpforCnpj = cpforCnpj || user.cpforCnpj;

    await user.save();

    return res.status(200).json({
      message: 'Usuário atualizado com sucesso.',
      user: { id: user.id, name: user.name, email: user.email, phone_number: user.phone_number },
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token ausente.' });
    }

    const decoded: any = jwt.verify(token, 'sua_chave_secreta');
    const userId = decoded.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const { old_password, new_password } = req.body;

    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha antiga incorreta.' });
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    user.password_hash = newPasswordHash;
    await user.save();

    return res.status(200).json({
      message: 'Senha atualizada com sucesso.',
      user: { password_hash: user.password_hash },
    });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};