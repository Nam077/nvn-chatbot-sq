import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { ListFont } from '@/interfaces/list-fonts.interface';

export type ListFontCreationAttributes = Optional<ListFont, 'id' | 'list'>;

export class ListFontModel extends Model<ListFont, ListFontCreationAttributes> implements ListFont {
    public id: number;
    public list: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ListFontModel {
    ListFontModel.init(
        {
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            list: {
                type: DataTypes.TEXT('long'),
                allowNull: false,
            },
        },
        {
            tableName: 'ListFonts',
            sequelize,
        },
    );

    return ListFontModel;
}
