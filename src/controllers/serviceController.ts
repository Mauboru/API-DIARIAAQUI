import { Request, Response } from 'express';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { Application } from '../models/Application';
import { verifyToken } from '../services/authService';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
import { parse, isValid } from 'date-fns';
import { format } from 'date-fns/format';

export const registerService = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')['1'];
        if (!token) return res.status(401).json({ message: 'Token ausente.' });

        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const { title, description, location, date_initial, date_final, pay, status } = req.body;

        if (!title || !description || !location || !date_initial || !date_final || !pay) { 
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }

        function convertDate(dateString: string): string | null {
            const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
            return isValid(parsedDate) ? format(parsedDate, 'yyyy-MM-dd') : null;
        }

        const formattedDateInitial = convertDate(date_initial);
        const formattedDateFinal = convertDate(date_final);

        if (!formattedDateInitial || !formattedDateFinal) {
            return res.status(400).json({ message: 'Formato de data inválido. Use DD/MM/YYYY.' });
        }

        const paymentValue = parseFloat(pay.toString().replace(',', '.'));
        if (isNaN(paymentValue) || paymentValue <= 0) {
            return res.status(400).json({ message: 'O pagamento deve ser um valor maior que 0.' });
        }

        const newService = await Service.create({
            employer_id: user.id,
            title,
            description,
            location,
            date_initial: formattedDateInitial,
            date_final: formattedDateFinal,
            pay: paymentValue,
            status
        });

        return res.status(201).json({
            message: 'Serviço criado com sucesso.',
            service: newService
        });
    } catch (error) {
        console.error("Erro no cadastro de serviço", error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

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

export const subscribe = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token ausente.' });

        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const { service_id, message } =  req.body;

        const servico = await Service.findByPk(service_id);
        if (!servico) return res.status(404).json({ message: 'Serviço não encontrado.' });

        if (!service_id || !message){ 
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }
        
        const subscribe = await Application.create({
            service_id: service_id,
            worker_id: user.id,
            message: message
        })
        return res.status(201).json({
            message: 'Inscrição feita com sucesso.',
            service: { id: subscribe.id, name: subscribe.message },
        });
    } catch (error) {
        console.log("Erro na inscrição de serviço", error);
        return res.status(500).json({ message: 'Erro interno do servidor.' })
    }
}

export const unsubscribe = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token ausente.' });

        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const { id } = req.params;
        console.log(id)

        const servico = await Application.findByPk(id);
        if (!servico) return res.status(404).json({ message: 'Inscrição não encontrada.' });
        
        await servico.destroy();
        return res.status(201).json({ message: 'Desinscrição feita com sucesso.' });
    } catch (error) {
        console.log("Erro na desinscrição de serviço", error);
        return res.status(500).json({ message: 'Erro interno do servidor.' })
    }
}

// Essas rotas provavelmente deveriam ser do usuario, eu acho
export const getSubscribedService = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token ausente.' });

        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const subscribedServices = await Service.findAll({
            include: [
                {
                    model: Application,
                    as: 'applications',
                    where: { worker_id: user.id },
                    attributes: ['id'], 
                },
                {
                    model: User,
                    as: 'employer',
                    attributes: ['id', 'name']
                }
            ],
            attributes: ['id', 'title', 'description', 'location', 'date_initial', 'date_final', 'status', 'pay']
        });

        if (!subscribedServices || subscribedServices.length === 0) {
            return res.status(200).json({ message: 'Nenhuma inscrição encontrada.', services: 0 });
        }

        return res.status(200).json({ services: subscribedServices });
    } catch (error) {
        console.error('Erro ao buscar inscrições:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

export const getUnsubscribedService = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token ausente.' });

        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const unsubscribedServices = await Service.findAll({
            where: {
                id: {
                    [Op.notIn]: sequelize.literal(`(SELECT service_id FROM da_applications WHERE worker_id = ${user.id})`)
                },
                employer_id: { [Op.ne]: user.id }
            },
            include: [
                {
                    model: User,
                    as: 'employer',
                    attributes: ['id', 'name']
                }
            ],
            attributes: ['id', 'title', 'description', 'location', 'date_initial', 'date_final', 'status', 'pay']
        });

        if (!unsubscribedServices || unsubscribedServices.length === 0) {
            return res.status(200).json({ message: 'Você já está inscrito em todos os serviços disponíveis.', services: 0 });
        }

        return res.status(200).json({ services: unsubscribedServices });
    } catch (error) {
        console.error('Erro ao buscar serviços não inscritos:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

export const getMyServices = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Token ausente.' });

        const decoded = verifyToken(token);
        if (!decoded) return res.status(401).json({ message: 'Token inválido.' });

        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

        const myServices = await Service.findAll({
            where: {
                employer_id: user.id 
            },
            include: [
                {
                    model: User,
                    as: 'employer',
                    attributes: ['id', 'name']
                }
            ],
            attributes: ['id', 'title', 'description', 'location', 'date_initial', 'date_final', 'status', 'pay']
        });

        if (!myServices || myServices.length === 0) {
            return res.status(200).json({ message: 'Você não criou nenhum serviço.', services: [] });
        }

        return res.status(200).json({ services: myServices });
    } catch (error) {
        console.error('Erro ao buscar serviços do usuário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};