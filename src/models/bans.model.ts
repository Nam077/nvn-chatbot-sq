import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Ban } from '@/interfaces/bans.interface';

export type BanCreationAttributes = Optional<Ban, 'id' | 'psid' | 'name' | 'reason'>;

export class BanModel extends Model<Ban, BanCreationAttributes> implements Ban {
    public id: number;
    public psid: string;
    public name: string;
    public reason: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof BanModel {
    BanModel.init(
        {
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },

            psid: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            reason: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'Bans',
            sequelize,
        },
    );

    return BanModel;
}
