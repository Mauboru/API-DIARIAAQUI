import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../src/instances/mysql';
import { User } from '../src/models/User';

interface ServiceAttributes {
  id?: number;
  employer_id: number;
  title: string;
  description: string;
  location: string;
  date: Date;
  pay: string;
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

  public static associate() {
    this.belongsTo(User, { foreignKey: 'employer_id' });
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
      type: DataTypes.DECIMAL(10, 2), 
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
