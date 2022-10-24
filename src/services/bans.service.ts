import DB from '@/databases';
import { Ban } from '@/interfaces/bans.interface';
class BanService {
    public async getAll(): Promise<Ban[]> {
        try {
            const allBans: Ban[] = await DB.Bans.findAll();
            return allBans;
        } catch (error) {
            return;
        }
    }
    public async createMultiple(bans: Ban[]): Promise<Ban[]> {
        try {
            await this.deleteAll();
            const createdBans: Ban[] = await DB.Bans.bulkCreate(bans);
            return createdBans;
        } catch (error) {
            return;
        }
    }
    public async getOne(id: number): Promise<Ban> {
        try {
            const ban: Ban = await DB.Bans.findByPk(id);
            return ban;
        } catch (error) {
            return;
        }
    }
    public async deleteAll() {
        try {
            const nameTable = DB.Bans.getTableName();
            DB.Bans.destroy({ where: {}, truncate: true });
            DB.sequelize.query(`ALTER TABLE ${nameTable} AUTO_INCREMENT = 1`);
        } catch (error) {
            return;
        }
    }
    public async update(id: number, ban: Ban): Promise<Ban> {
        try {
            await DB.Bans.update(ban, { where: { id: id } });
            return await this.getOne(ban.id);
        } catch (error) {
            return;
        }
    }
    public async create(ban: Ban): Promise<Ban> {
        try {
            const createdBan: Ban = await DB.Bans.create(ban);
            return createdBan;
        } catch (error) {
            return;
        }
    }
    public async delete(id: number): Promise<any> {
        try {
            await DB.Bans.destroy({ where: { id: id } });
        } catch (error) {
            return;
        }
    }
    public async deleteByPsid(psid: string): Promise<any> {
        try {
            await DB.Bans.destroy({ where: { psid: psid } });
        } catch (error) {
            return;
        }
    }
    public async getOneByPsid(psid: string): Promise<Ban> {
        try {
            const ban: Ban = await DB.Bans.findOne({ where: { psid: psid } });
            return ban;
        } catch (error) {
            return;
        }
    }
    public async updateByPsid(psid: string, ban: Ban): Promise<Ban> {
        try {
            await DB.Bans.update(ban, { where: { psid: psid } });
            return await this.getOneByPsid(psid);
        } catch (error) {
            return;
        }
    }
}
export default BanService;
