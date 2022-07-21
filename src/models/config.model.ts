import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Config } from '@/interfaces/config.interface';

export type ConfigCreationAttributes = Optional<Config, 'id' | 'key' | 'value'>;

export class ConfigModel extends Model<Config, ConfigCreationAttributes> implements Config {
    public id: number;
    public key: string;
    public value: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ConfigModel {
    ConfigModel.init(
        {
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },

            key: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            value: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'Configs',
            sequelize,
        },
    );

    return ConfigModel;
}
