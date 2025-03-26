import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { sendVerificationCodeService } from '../services/twilioService';
import { Op } from 'sequelize';
import { generateToken, verifyToken } from '../services/authService';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone_number, cpf_or_cnpj } = req.body;

    const existing_cpf_or_cnpj = await User.findOne({ where: { cpf_or_cnpj } });
    if (existing_cpf_or_cnpj) return res.status(400).json({ message: 'Este CPF/CNPJ já está registrado.' });

    const existing_email = await User.findOne({ where: { email } });
    if (existing_email) return res.status(400).json({ message: 'Este e-mail já está registrado.' });

    const existing_phone_number = await User.findOne({ where: { phone_number } });
    if (existing_phone_number) return res.status(400).json({ message: 'Este número já está registrado.' });

    const password_hash = await bcrypt.hash(password, 10);
    const random_image_index = Math.floor(Math.random() * 10) + 1;

    await User.create({
      name,
      email,
      password_hash,
      phone_number,
      cpf_or_cnpj,
      profile_image: random_image_index,
    });

    return res.status(201).json({ message: 'Usuário criado com sucesso.' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado!' });

    await user.destroy();

    return res.status(200).json({ message: 'Usuário desativado com sucesso.' });   
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { cpf_or_cnpj_or_email, password } = req.body;

    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ cpf_or_cnpj: cpf_or_cnpj_or_email }, { email: cpf_or_cnpj_or_email }],
        deletedAt: null
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas ou usuário desativado.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = generateToken({ id: user.id, email: user.email });

    return res.status(200).json({
      message: 'Login bem-sucedido.',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
    
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token ausente.' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const { password_hash, createdAt, updatedAt, phone_number, ...userData } = user.toJSON();
    return res.status(200).json({
      ...userData,
      phone_number: phone_number ? phone_number.slice(3) : null,
  });
    
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
    const user = await User.findByPk(id, { paranoid: false });

    if (!user) return res.status(404).json({ message: 'Usuário não encontrado!' });

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro ao buscar o usuário.' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token ausente.' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const { name, email, phone_number, cpf_or_cnpj } = req.body;

    const isPhoneModified = user.phone_number !== phone_number;
    let verified_phone = user.verified_phone;
    if (isPhoneModified && verified_phone === true) {
      verified_phone = false;
    }
    await user.update({ verified_phone });

    if (cpf_or_cnpj && cpf_or_cnpj !== user.cpf_or_cnpj) {
      const existingCpfOrCnpj = await User.findOne({ where: { cpf_or_cnpj } });
      if (existingCpfOrCnpj) {
        return res.status(400).json({ message: 'Este CPF/CNPJ já está registrado.' });
      }
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: 'Este email já está registrado.' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone_number = phone_number || user.phone_number;
    user.cpf_or_cnpj = cpf_or_cnpj || user.cpf_or_cnpj;

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

export const updateUserPassword = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token ausente.' });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const { old_password, new_password } = req.body;

    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha antiga incorreta.' });
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);
    user.password_hash = newPasswordHash;
    await user.save();

    return res.status(200).json({
      message: 'Senha atualizada com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const verificationUserPhoneCode = async (req: Request, res: Response) => {
  try {
    const { code, phone_number } = req.body;

    if (!code || !phone_number) {
      return res.status(400).json({ message: 'Código e número de telefone são obrigatórios.' });
    }

    const user = await User.findOne({ where: { phone_number } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado com esse número de telefone.' });
    
    if (user.code_phone !== code) return res.status(400).json({ message: 'Código de verificação incorreto.' });
    user.verified_phone = true;
    await user.save();

    return res.status(201).json({ message: 'Telefone verificado com sucesso.' });
  } catch (error) {
    console.error('Erro ao verificar código do telefone:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

export const resendUserVerificationCodeService = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.body;
    const { code: phone_code } = await sendVerificationCodeService(phone_number);

    const user = await User.findOne({ where: { phone_number } });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado com esse número de telefone.' });

    await user.update({ code_phone: phone_code });
    return res.status(200).json({ message: 'Código reenviado com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
}