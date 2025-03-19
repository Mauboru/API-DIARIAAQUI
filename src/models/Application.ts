import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../instances/mysql';
import { Service } from './Service';
import { User } from './User';

export class Application extends Model {
  public id!: number;
  public service_id!: number;
  public worker_id!: number;
  public message!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Application.init(
  {
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'da_services',
        key: 'id',
      },
    },
    worker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'da_users',
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'da_applications',
    modelName: 'Application',
    timestamps: true,
  }
);

// Correção nos relacionamentos
Application.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' }); // Nome corrigido
Application.belongsTo(Service, { foreignKey: 'service_id', as: 'service' }); // Nome corrigido
