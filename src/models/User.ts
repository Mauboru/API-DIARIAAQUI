import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../instances/mysql';
import bcrypt from 'bcrypt';

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password_hash!: string;
  public phone_number!: string;
  public cpforCnpj!: string; 
  public profileImage!: number; 
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static hashPassword(password: string): string {
    return bcrypt.hashSync(password, 10);
  }

  public static isPasswordValid(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cpforCnpj: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    profileImage: {
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
  },
  {
    sequelize,
    tableName: 'da_users',
    timestamps: true,
  }
);
