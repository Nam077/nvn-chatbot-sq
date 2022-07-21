import DB from '@/databases';
import { Food } from '@/interfaces/foods.interface';
import { truncate } from 'fs';
import sequelize from 'sequelize';
class FoodService {
    async getAll(): Promise<Food[]> {
        return await DB.Foods.findAll();
    }
    async getById(id: number): Promise<Food> {
        return await DB.Foods.findByPk(id);
    }
    async create(food: Food): Promise<Food> {
        return await DB.Foods.create(food);
    }
    async update(id: number, food: Food): Promise<Food> {
        await DB.Foods.update(food, { where: { id } });
        return await DB.Foods.findByPk(id);
    }
    async delete(id: number): Promise<any> {
        return await DB.Foods.destroy({ where: { id } });
    }
    async createMultiple(foods: Food[]): Promise<Food[]> {
        try {
            await DB.Foods.bulkCreate(foods);
            return;
        } catch (error) {
            throw error;
        }
    }
    async getOneRandom(): Promise<Food> {
        const food = await DB.Foods.findAll({ order: [sequelize.fn('RAND')], limit: 1 });
        return food[0];
    }
    async deleteAll(): Promise<any> {
        //delete all foods using truncate
        await DB.Foods.destroy({ where: {}, truncate: true });
        const nameTable = DB.Foods.getTableName();
        await DB.sequelize.query(`ALTER TABLE ${nameTable} AUTO_INCREMENT = 1`);
        return;
    }
}
export default FoodService;
