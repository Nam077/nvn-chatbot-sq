import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Font } from '@/interfaces/fonts.interface';

export type FontCreationAttributes = Optional<Font, 'id' | 'key' | 'name' | 'image' | 'link' | 'post_link' | 'message'>;

export class FontModel extends Model<Font, FontCreationAttributes> implements Font {
    public id: number;
    public key: string;
    public name: string;
    public link: string;
    public image: string;
    public message: string;
    public post_link: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof FontModel {
    FontModel.init(
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
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            image: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            link: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT('long'),
                allowNull: false,
            },
            post_link: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: 'Fonts',
            sequelize,
        },
    );

    return FontModel;
}
