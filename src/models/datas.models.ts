import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Data } from '@/interfaces/datas.interface';

export type DataCreationAttributes = Optional<Data, 'id' | 'key' | 'response' | 'image'>;

export class DataModel extends Model<Data, DataCreationAttributes> implements Data {
    public id: number;
    public key: string;
    public response: string;
    public image: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof DataModel {
    DataModel.init(
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

            image: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            response: {
                type: DataTypes.TEXT('long'),
                allowNull: false,
            },
        },
        {
            tableName: 'Datas',
            sequelize,
        },
    );

    return DataModel;
}
