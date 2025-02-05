import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Service } from '../models/Service';

export const registerService = async (req: Request, res: Response): Promise<Response> => {
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

        const { title, description, location, date_initial, date_final, pay, status } =  req.body;

        if (!title || !description || !location || !date_initial || !date_final || !pay) return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        
        const newService = await Service.create({
            employer_id: user.id,
            title: title,
            description: description,
            location: location,
            date_initial: date_initial,
            date_final: date_final,
            pay: pay,
            status: status
        })
        return res.status(201).json({
            message: 'Serviço criado com sucesso.',
            service: { id: newService.id, name: newService.title },
        });
    } catch (error){
        console.log("Erro no cadastro de serviço", error);
        return res.status(500).json({ message: 'Erro interno do servidor.' })
    }
}
