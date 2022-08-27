import { Font } from '@/interfaces/fonts.interface';
import { ListFont } from '@/interfaces/list-fonts.interface';
import DB from '@databases';
export interface PaginateData {
    count: number;
    allPage: number;
    limit: number;
    currentPage: number;
    fonts: Font[];
}
class FontService {
    public async getAll(): Promise<Font[]> {
        try {
            const allFont: Font[] = await DB.Fonts.findAll();
            return allFont;
        } catch (error) {
            return;
        }
    }
    public async getEndPage(limit: number): Promise<number> {
        try {
            const count: number = await DB.Fonts.count();
            return Math.ceil(count / limit);
        } catch (error) {
            return;
        }
    }
    public async createMultiple(fonts: Font[]): Promise<Font[]> {
        try {
            await this.deleteAll();
            fonts = fonts.filter((font) => font.name !== '');
            const createdFonts: Font[] = await DB.Fonts.bulkCreate(fonts);
            return createdFonts;
        } catch (error) {
            return;
        }
    }
    public getList(fonts: Font[], lenght: number): ListFont[] {
        try {
            const nameFonts: string[] = fonts.map((font) => font.name);
            const nameFontsUnique: string[] = [...new Set(nameFonts)];
            const nameFontsUniqueDivide: string[][] = [];
            for (let i = 0; i < nameFontsUnique.length; i += lenght) {
                nameFontsUniqueDivide.push(nameFontsUnique.slice(i, i + lenght));
            }
            let listFont: ListFont[] = [];
            nameFontsUniqueDivide.forEach((nameFontsUniqueDivide) => {
                let dataPush = nameFontsUniqueDivide.join('\n\n').toString();
                listFont.push({ list: dataPush });
            });
            return listFont;
        } catch (error) {
            return;
        }
    }
    public async deleteAll() {
        try {
            await DB.Fonts.destroy({ where: {}, truncate: true });
            const nameTable = DB.Fonts.getTableName();
            await DB.sequelize.query(`ALTER TABLE ${nameTable} AUTO_INCREMENT = 1`);
        } catch (error) {
            return;
        }
    }
    public async getOne(id: number): Promise<Font> {
        try {
            const font: Font = await DB.Fonts.findByPk(id);
            return font;
        } catch (error) {
            return;
        }
    }
    public async update(id: number, font: Font): Promise<Font> {
        try {
            await DB.Fonts.update(font, { where: { id: id } });
            return await this.getOne(font.id);
        } catch (error) {
            return;
        }
    }
    public async create(font: Font): Promise<Font> {
        try {
            const createdFont: Font = await DB.Fonts.create(font);
            return createdFont;
        } catch (error) {
            return;
        }
    }
    public async delete(id: number): Promise<any> {
        try {
            await DB.Fonts.destroy({ where: { id: id } });
        } catch (error) {
            return;
        }
    }
    public async getOneByKey(key: string): Promise<Font> {
        try {
            const font: Font = await DB.Fonts.findOne({ where: { key: key } });
            return font;
        } catch (error) {
            return;
        }
    }
    public async getPaginate(page: number, limit: number): Promise<PaginateData> {
        try {
            //get count of all fonts
            const count: number = await DB.Fonts.count();
            if (limit < 1 || limit > count) {
                limit = 10;
            }
            if (page > Math.ceil(count / limit)) {
                page = Math.ceil(count / limit);
            }
            if (+page < 1) {
                page = 1;
            }
            const fonts: Font[] = await DB.Fonts.findAll({
                offset: (page - 1) * limit,
                limit: limit,
            });
            const allPage: number = Math.ceil(count / limit);
            const currentPage: number = page;
            return { count, allPage, limit, currentPage, fonts };
        } catch (error) {
            return;
        }
    }
}
export default FontService;
