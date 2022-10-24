import { Data } from '@/interfaces/datas.interface';
import DB from '@databases';

class DataService {
    public async getAll(): Promise<Data[]> {
        try {
            const allData: Data[] = await DB.Datas.findAll();
            return allData;
        } catch (error) {
            return;
        }
    }
    public async createMultiple(datas: Data[]): Promise<Data[]> {
        try {
            await this.deleteAll();
            const createdDatas: Data[] = await DB.Datas.bulkCreate(datas);
            return createdDatas;
        } catch (error) {
            return;
        }
    }
    public async deleteAll() {
        try {
            await DB.Datas.destroy({ where: {}, truncate: true });
            const nameTable = DB.Datas.getTableName();
            await DB.sequelize.query(`ALTER TABLE ${nameTable} AUTO_INCREMENT = 1`);
        } catch (error) {
            return;
        }
    }
    public async getOne(id: number): Promise<Data> {
        try {
            const data: Data = await DB.Datas.findByPk(id);
            return data;
        } catch (error) {
            return;
        }
    }
    public async update(id: number, data: Data): Promise<Data> {
        try {
            await DB.Datas.update(data, { where: { id: id } });
            return await this.getOne(data.id);
        } catch (error) {
            return;
        }
    }
    public async create(data: Data): Promise<Data> {
        try {
            const createdData: Data = await DB.Datas.create(data);
            return createdData;
        } catch (error) {
            return;
        }
    }
    public async delete(id: number): Promise<any> {
        try {
            await DB.Datas.destroy({ where: { id: id } });
        } catch (error) {
            return;
        }
    }
    public async getOneByKey(key: string): Promise<Data> {
        try {
            const data: Data = await DB.Datas.findOne({ where: { key: key } });
            return data;
        } catch (error) {
            return;
        }
    }
}
export default DataService;
