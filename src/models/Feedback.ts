import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../instances/mysql';
import { Service } from './Service';
import { User } from './User';

export class Feedback extends Model {
  public id!: number;
  public service_id!: number;
  public reviewer_id!: number;
  public rating!: number;
  public comment!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate() {
    this.belongsTo(Service, { foreignKey: 'service_id' });
    this.belongsTo(User, { foreignKey: 'reviewer_id' });
  }
}

Feedback.init(
  {
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'da_services',
        key: 'id',
      },
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'da_users',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'da_feedbacks',
    modelName: 'Feedback',
    timestamps: true,
  }
);
