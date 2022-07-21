import DB from '@/databases';
import { Config } from '@/interfaces/config.interface';
class ConfigService {
    async create(config: Config): Promise<Config> {
        try {
            return await DB.Configs.create(config);
        } catch (error) {
            return;
        }
    }
    async getAll(): Promise<Config[]> {
        try {
            return await DB.Configs.findAll();
        } catch (error) {
            return;
        }
    }
    async getOne(id: number): Promise<Config> {
        try {
            return await DB.Configs.findByPk(id);
        } catch (error) {
            return;
        }
    }
    async update(id: number, config: Config): Promise<Config> {
        try {
            await DB.Configs.update(config, { where: { id: id } });
            return await this.getOne(config.id);
        } catch (error) {
            return;
        }
    }
    async delete(id: number): Promise<any> {
        try {
            return await DB.Configs.destroy({ where: { id: id } });
        } catch (error) {
            return;
        }
    }
    async deleteAll(): Promise<any> {
        try {
            await DB.Configs.destroy({ where: {}, truncate: true });
            const nameTable = DB.Configs.getTableName();
            await DB.sequelize.query(`ALTER TABLE ${nameTable} AUTO_INCREMENT = 1`);
            return;
        } catch (error) {
            return;
        }
    }
    async getByKey(key: string): Promise<Config> {
        try {
            return await DB.Configs.findOne({ where: { key: key } });
        } catch (error) {
            return;
        }
    }
    async updateByKey(key: string, value: string): Promise<Config> {
        try {
            const config: Config = await this.getByKey(key);
            if (!config) throw new Error('Config not found');
            await DB.Configs.update({ value: value }, { where: { key: key } });
            return await this.getByKey(key);
        } catch (error) {
            return;
        }
    }
    async setUpDefaultConfigs(): Promise<any> {
        try {
            const configs: Config[] = [
                { key: 'FontList', value: 'true' },
                { key: 'Ban', value: 'true' },
            ];
            await this.deleteAll();
            await this.createMultiple(configs);
        } catch (error) {
            return;
        }
    }
    async createMultiple(configs: Config[]): Promise<Config[]> {
        try {
            await this.deleteAll();
            const createdConfigs: Config[] = await DB.Configs.bulkCreate(configs);
            return createdConfigs;
        } catch (error) {
            return;
        }
    }
}
export default ConfigService;
