import { GoogleSpreadsheet } from 'google-spreadsheet';
require('dotenv').config();
class SheetService {
    //get doc from getDoc in constructor
    public async getDoc() {
        try {
            const PRIVATE_KEY = process.env.PRIVATE_KEY_GG.replace(/\\n/g, '\n');
            const SHEET_ID = process.env.SHEET_ID;
            const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
            const doc = new GoogleSpreadsheet(SHEET_ID);
            await doc.useServiceAccountAuth({
                client_email: CLIENT_EMAIL,
                private_key: PRIVATE_KEY,
            });
            await doc.loadInfo();
            return doc;
        } catch (error) {
            return;
        }
    }

    public async getDatas(): Promise<any> {
        const doc = await this.getDoc();
        const sheetFont = doc.sheetsByIndex[0];
        const rowFonts = await sheetFont.getRows();
        const sheetData = doc.sheetsByIndex[1];
        const dataFinal = [];
        const fonts: any = [];
        const datas: any = [];
        rowFonts.forEach((row) => {
            var key = row.Key;
            key = key.trim().toLowerCase();
            let arrKey = key.split(',');
            arrKey.forEach((k: string) => {
                if (k.trim() != '') {
                    fonts.push({
                        name: row.Name,
                        key: k.trim(),
                        link: row.Link,
                        image: row.Image,
                        message: row.Message,
                        post_link: row.Post_Link,
                    });
                }
            });
        });
        const rowDatas = await sheetData.getRows();
        rowDatas.forEach((row) => {
            var key = row.Key;
            key = key.trim().toLowerCase();
            let arrKey = key.split(',');
            arrKey.forEach((k: string) => {
                if (k.trim() != '') {
                    datas.push({
                        key: k.trim(),
                        response: row.Response,
                        image: row.Image || '',
                    });
                }
            });
        });
        return { datas: datas, fonts: fonts };
    }
}
export default SheetService;
