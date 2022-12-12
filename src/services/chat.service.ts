import { Ban } from '@/interfaces/bans.interface';
import { Data } from '@/interfaces/datas.interface';
import { Font } from '@/interfaces/fonts.interface';
import { Food } from '@/interfaces/foods.interface';
import { ListFont } from '@/interfaces/list-fonts.interface';
import BanService from './bans.service';
import ConfigService from './configs.service';
import CrawlerService from './crawler.service';
import DataService from './datas.service';
import FontService, { PaginateData } from './fonts.service';
import FoodService from './foods.service';
import ListFontService from './list-font.service';
import { pthh } from '@services/balance-the-chemical-equation.service';

class ChatService {
    public fontService = new FontService();
    public dataService = new DataService();
    public banService = new BanService();
    public configService = new ConfigService();
    public listFontService = new ListFontService();
    public foodService = new FoodService();
    public crawlerService = new CrawlerService();

    public async checkFont(message: string): Promise<Font[]> {
        const fonts: Font[] = await this.fontService.getAll();
        const icludesFont: Font[] = new Array();
        fonts.forEach((font) => {
            if (message.toLowerCase().includes(font.key.toLocaleLowerCase())) {
                icludesFont.push(font);
            }
        });
        return icludesFont;
    }

    public async checkData(message: string): Promise<Data[]> {
        const datas: Data[] = await this.dataService.getAll();
        let icludesData: Data[] = new Array();

        datas.forEach((data) => {
            if (message.toLowerCase().includes(data.key.toLocaleLowerCase())) {
                icludesData.push(data);
                return icludesData;
            }
        });
        return icludesData;
    }

    public getDataMessage(fonts: Font[]): string[] {
        const data: string[] = new Array();
        const fontCheckArray: Font[][] = [];
        let message: string = 'Đây là toàn bộ font của bạn: \n\n';
        for (let i = 0; i < fonts.length; i++) {
            if (i % 10 == 0) {
                fontCheckArray.push([]);
            }
            fontCheckArray[Math.floor(i / 10)].push(fonts[i]);
        }
        for (let i = 0; i < fontCheckArray.length; i++) {
            for (let j = 0; j < fontCheckArray[i].length; j++) {
                message += 'Tên: ' + fontCheckArray[i][j].name + '\nLink tải: ' + fontCheckArray[i][j].link + '\n\n';
            }
            data.push(message);
            message = '';
        }
        return data;
    }

    public async getListFont(): Promise<ListFont[]> {
        return await this.listFontService.getAll();
    }

    public async getBanList(): Promise<Ban[]> {
        return await this.banService.getAll();
    }

    public async adminFuntion(message: String): Promise<any> {
        let result: any = new Object();

        //@nvn list off
        if (message.toLowerCase().includes('list off')) {
            await this.configService.updateByKey('FontList', 'false');
            return (result = {
                function: 'setConfig',
                key: 'FontList',
                value: 'false',
                message: 'Tính năng tải nhiều font đã tắt',
            });
        }
        //@nvn list on
        if (message.toLowerCase().includes('list on')) {
            await this.configService.updateByKey('FontList', 'true');
            return (result = {
                function: 'setConfig',
                key: 'FontList',
                value: 'true',
                message: 'Tính năng tải nhiều font đã bật',
            });
        }
        //@nvn ban off
        if (message.toLowerCase().includes('ban off')) {
            await this.configService.updateByKey('Ban', 'false');
            return (result = {
                function: 'setConfig',
                key: 'Ban',
                value: 'false',
                message: 'Tính năng ban đã tắt',
            });
        }
        //@nvn ban on
        if (message.toLowerCase().includes('ban on')) {
            await this.configService.updateByKey('Ban', 'true');
            return (result = {
                function: 'setConfig',
                key: 'Ban',
                value: 'true',
                message: 'Tính năng ban đã bật',
            });
        }
        //@nvn uban all
        if (message.toLowerCase().includes('unban all')) {
            await this.banService.deleteAll();
            return (result = {
                function: 'Unban',
                message: 'Đã xóa tất cả các tài khoản bị ban',
                value: 'multiple',
            });
        }
        if (message.toLowerCase().includes('unban')) {
            const psid = message.replace('@nvn unban', '').trim().replace(' ', '');
            console.log(psid);
            if (psid) {
                const ban: Ban = await this.banService.getOneByPsid(psid + '');
                if (ban) {
                    this.banService.delete(ban.id);
                    return (result = {
                        function: 'Unban',
                        message: 'Đã xóa tài khoản ' + ban.psid + ' khỏi danh sách bị ban',
                        psid: ban.psid,
                        value: 'success',
                    });
                } else {
                    return (result = {
                        function: 'Unban',
                        message: 'Không tìm thấy tài khoản ' + psid + ' trong danh sách bị ban',
                        psid: psid,
                        value: 'error',
                    });
                }
            }
        }

        //@nvn ban list
        if (message.toLowerCase().includes('ban list')) {
            const bans = await this.getBanList();
            let messageBan = 'Danh sách tài khoản bị cấm: \n\n';
            const data: string[] = new Array();
            const banArray: Ban[][] = [];
            for (let i = 0; i < bans.length; i++) {
                if (i % 10 == 0) {
                    banArray.push([]);
                }
                banArray[Math.floor(i / 10)].push(bans[i]);
            }
            for (let i = 0; i < banArray.length; i++) {
                for (let j = 0; j < banArray[i].length; j++) {
                    messageBan += 'Tên: ' + banArray[i][j].name + '\nPsid: ' + banArray[i][j].psid + '\n\n';
                }
                data.push(messageBan);
                messageBan = '';
            }
            if (data.length == 0) {
                data.push('Không có tài khoản bị cấm !');
            }
            return (result = {
                function: 'BanList',
                data: data,
            });
        }
        if (message.toLowerCase().includes('@nvn ban')) {
            const psid = message.replace('@nvn ban', '').trim().replace(' ', '');
            if (psid) {
                const ban: Ban = await this.banService.getOneByPsid(psid);
                if (ban) {
                    return (result = {
                        function: 'Ban-Psid',
                        message: 'Tài khoản ' + ban.psid + ' đã bị cấm',
                        psid: ban.psid,
                        value: 'duplicate',
                    });
                } else {
                    const ban: Ban = {
                        psid: psid,
                        name: '',
                        reason: 'Do vi phạm quy định của page',
                    };
                    ban.psid = psid;
                    await this.banService.create(ban);
                    return (result = {
                        function: 'Ban-Psid',
                        message: 'Tài khoản ' + ban.psid + ' đã bị cấm',
                        psid: ban.psid,
                        value: 'success',
                    });
                }
            }
        }
    }

    public async getRecommendFood(): Promise<Food> {
        return await this.foodService.getOneRandom();
    }

    public async getCrawler(key: string): Promise<any> {
        const crawler: any = await this.crawlerService.getCrwaler(key);
        const arrayResult: any = new Array();
        const array = [];
        //remove duplicate item.value in crawler
        for (let i = 0; i < crawler.length; i++) {
            if (arrayResult.indexOf(crawler[i].value) == -1) {
                arrayResult.push(crawler[i].value);
                array.push(crawler[i]);
            }
        }
        return array;
    }

    public async getYtb(key: string): Promise<any> {
        const ytb = await this.crawlerService.getYoutube(key);
        if (ytb) {
            return ytb;
        } else {
            return null;
        }
    }

    public async getXSMB(): Promise<any> {
        return await this.crawlerService.crawlerXSMB();
    }

    public async getCovid(message: string): Promise<any> {
        return await this.crawlerService.crawlerCovid19(message);
    }

    public async getPaginateFont(page: number, limit: number): Promise<PaginateData> {
        return await this.fontService.getPaginate(page, limit);
    }

    public async getEndPageFont(limit: number): Promise<number> {
        return await this.fontService.getEndPage(limit);
    }

    public getPTHH(received_message: string) {
        const pthh_str = received_message.replace('@pthh ', '');

        const pthh_result = pthh(pthh_str);
        if (pthh) {
            return pthh_result.text;
        } else {
            return null;
        }
    }

    public getQrcode(received_message: string) {
        const qrcode_str = received_message.replace('@qr ', '');
        let link = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + qrcode_str;
        return 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + qrcode_str;
    }

    public async getApiTalk(message: string): Promise<string> {
        return await this.crawlerService.apiTalk(message);
    }
}

export default ChatService;
