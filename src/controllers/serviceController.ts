import { Request, Response } from 'express';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { verifyToken } from '../services/authService';

export const registerService = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token ausente.' });

        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const { title, description, location, date_initial, date_final, pay, status } =  req.body;

        if (!title || !description || !location || !date_initial || !date_final || !pay){ 
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        function isValidDate(dateString: string): boolean {
            if (!dateRegex.test(dateString)) return false;
            const date = new Date(dateString);
            return !isNaN(date.getTime());
        }
        if (!isValidDate(date_initial) || !isValidDate(date_final)) {
            return res.status(400).json({ message: 'Formato de data inválido ou data inexistente. Use YYYY-MM-DD.' });
        }

        const paymentValue = parseFloat(pay.toString().replace(',', '.'));
        if (isNaN(paymentValue) || paymentValue <= 0) {
            return res.status(400).json({ message: 'O pagamento deve ser um valor maior que 0.' });
        }
        
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

export const getService = async (req: Request, res: Response) => {
    try {
        const services = await Service.findAll({
            attributes: { exclude: ['employer_id'] }, 
            include: [
                {
                    model: User,
                    as: 'employer',
                    attributes: ['id', 'name'],
                },
            ],
        });

        if (!services || services.length === 0) {
            return res.status(404).json({ message: 'Nenhum serviço encontrado.' });
        }

        return res.status(200).json({ services });
    } catch (error) {
        console.error("Erro ao buscar serviços", error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};
