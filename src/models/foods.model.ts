import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { Food } from '@/interfaces/foods.interface';

export type FoodCreationAttributes = Optional<Food, 'id' | 'name' | 'description' | 'image' | 'recipe'>;

export class FoodModel extends Model<Food, FoodCreationAttributes> implements Food {
    public id: number;
    public name: string;
    public description: string;
    public image: string;
    public recipe: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof FoodModel {
    FoodModel.init(
        {
            id: {
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT('long'),
                allowNull: false,
            },
            image: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            recipe: {
                type: DataTypes.TEXT('long'),
                allowNull: false,
            },
        },
        {
            tableName: 'Foods',
            sequelize,
        },
    );

    return FoodModel;
}
