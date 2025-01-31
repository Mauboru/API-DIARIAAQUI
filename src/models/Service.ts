import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../instances/mysql';
import { User } from './User'; // Ajuste o caminho de acordo com a estrutura do projeto

interface ServiceAttributes {
  id?: number;
  employer_id: number;
  title: string;
  description: string;
  location: string;
  date: Date;
  pay: string; // ou use DECIMAL, dependendo da precisão que deseja
  status: 'open' | 'in_progress' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}

export class Service extends Model<ServiceAttributes> implements ServiceAttributes {
  public id!: number;
  public employer_id!: number;
  public title!: string;
  public description!: string;
  public location!: string;
  public date!: Date;
  public pay!: string;
  public status!: 'open' | 'in_progress' | 'completed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Define os relacionamentos
  public static associate() {
    this.belongsTo(User, { foreignKey: 'employer_id' });
    // Aqui você pode adicionar o relacionamento com Feedback, caso o modelo de Feedback já exista.
  }
}

Service.init(
  {
    employer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    pay: {
      type: DataTypes.DECIMAL(10, 2), // Ou você pode optar por usar string dependendo de seu caso
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'completed'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'da_services',
    modelName: 'Service',
    timestamps: true,
  }
);
