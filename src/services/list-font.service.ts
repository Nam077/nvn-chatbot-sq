import DB from '@/databases';
import { Font } from '@/interfaces/fonts.interface';
import { ListFont } from '@/interfaces/list-fonts.interface';
class ListFontService {
    public async getAll(): Promise<ListFont[]> {
        try {
            const allListFont: ListFont[] = await DB.ListFonts.findAll();
            return allListFont;
        } catch (error) {
            return;
        }
    }
    public async createMultiple(listFonts: ListFont[]): Promise<ListFont[]> {
        try {
            await this.deleteAll();
            const createdListFonts: ListFont[] = await DB.ListFonts.bulkCreate(listFonts);
            return createdListFonts;
        } catch (error) {
            return;
        }
    }
    public async getOne(id: number): Promise<Font> {
        try {
            const listFont: ListFont = await DB.ListFonts.findByPk(id);
            return listFont;
        } catch (error) {
            return;
        }
    }
    public async deleteAll() {
        try {
            const nameTable = DB.ListFonts.getTableName();
            DB.ListFonts.destroy({ where: {}, truncate: true });
            DB.sequelize.query(`ALTER TABLE ${nameTable} AUTO_INCREMENT = 1`);
        } catch (error) {
            return;
        }
    }
    public async update(id: number, listFont: ListFont): Promise<ListFont> {
        try {
            await DB.ListFonts.update(listFont, { where: { id: id } });
            return await this.getOne(listFont.id);
        } catch (error) {
            return;
        }
    }
    public async create(listFont: ListFont): Promise<ListFont> {
        try {
            const createdListFont: ListFont = await DB.ListFonts.create(listFont);
            return createdListFont;
        } catch (error) {
            return;
        }
    }
    public async delete(id: number): Promise<any> {
        try {
            await DB.ListFonts.destroy({ where: { id: id } });
        } catch (error) {
            return;
        }
    }
}
export default ListFontService;
