import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../instances/mysql';
import { User } from './User';

export class Service extends Model{
  public id!: number;
  public employer_id!: number;
  public title!: string;
  public description!: string;
  public location!: string;
  public date_initial!: Date;
  public date_final!: Date;
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
    date_initial: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    date_final: {
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
