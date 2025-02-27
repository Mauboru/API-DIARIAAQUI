import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../instances/mysql';
import bcrypt from 'bcrypt';

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password_hash!: string;
  public phone_number!: string;
  public cpf_or_cnpj!: string; 
  public profile_image!: number; 
  public verified_phone!: boolean;
  public code_phone!: string;
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
    cpf_or_cnpj: { 
      type: DataTypes.STRING,
      allowNull: false, 
    },
    profile_image: {
      type: DataTypes.INTEGER,
      allowNull: false, 
    },
    verified_phone: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    code_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'da_users',
    timestamps: true,
  }
);
