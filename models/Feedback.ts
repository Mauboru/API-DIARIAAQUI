import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../src/instances/mysql';
import { Service } from '../src/models/Service';
import { User } from '../src/models/User';

interface FeedbackAttributes {
  id?: number;
  service_id: number;
  reviewer_id: number;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Feedback extends Model<FeedbackAttributes> implements FeedbackAttributes {
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
