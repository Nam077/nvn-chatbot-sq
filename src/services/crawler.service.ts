import axios from 'axios';
import cheerio from 'cheerio';
import * as yt from 'youtube-search-without-api-key';
const translate = require('translate-google');
class CrawlerService {
    public getCrwaler = async (message: string): Promise<String[]> => {
        let dataReturn = [];
        try {
            //replace all space in message
            let messageCheck = message.replace(/\s/g, '');
            messageCheck = this.stripAccent(messageCheck);
            if (messageCheck.includes('cov' || 'covid' || 'corona' || 'cô vi' || 'corona')) {
                return;
            }
            let encodedString = encodeURI(message);

            let url = `https://www.google.com.vn/search?q=${encodedString}&hl=vi&gl=VN`;
            //using Agent to get response from google
            const agent = axios.create({
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                },
            });
            const { data } = await agent.get(url);
            const $ = cheerio.load(data);
            let infor = $(data).find('span.hgKElc').text();
            if (infor != null && infor !== '') {
                dataReturn.push({
                    key: 'infor',
                    value: infor,
                });
            }
            //Hỏi thông tin về năm sinh
            let year = $(data).find('div.Z0LcW').text();
            if (year != null && year !== '') {
                dataReturn.push({
                    key: 'year',
                    value: year,
                });
            }
            let checkwheather: string = $(data).find('span#wob_tm').text();

            if (checkwheather != null && checkwheather !== '') {
                let wheather =
                    `Thời tiết hiện tại tại: ${$(data).find('div#wob_loc').text()}\n` +
                    `Nhiệt độ: ${$(data).find('span#wob_tm').text()} °C\n` +
                    `Bầu trời: ${$(data).find('span#wob_dc').text()}\n` +
                    `Khả năng có mưa: ${$(data).find('span#wob_pp').text()}\n` +
                    `Độ ẩm: ${$(data).find('span#wob_hm').text()} %\n`;
                dataReturn.push({
                    key: 'wheather',
                    value: wheather,
                });
            }
            //Giá Bitcoin
            let bitcoin = $(data).find('span.pclqee').text();
            if (bitcoin != null && bitcoin !== '') {
                // console.log("5");
                let text: string = bitcoin + ' ' + $(data).find('span.dvZgKd').text();
                dataReturn.push({
                    key: 'bitcoin',
                    value: text,
                });
            }
            //ngay le
            let dateFestival = $(data).find('div.zCubwf').text();
            if (dateFestival != null && dateFestival !== '') {
                // console.log("6");
                dataReturn.push({
                    key: 'dateFestival',
                    value: dateFestival,
                });
            }
            //bong da
            let team1 = $(data).find('div.kno-fb-ctx > span').first().text();
            if (team1 != null && team1 !== '') {
                let score1 = $(data).find('div.imso_mh__l-tm-sc.imso_mh__scr-it.imso-light-font').last().text();
                let team2 = $(data).find('div.kno-fb-ctx > span').last().text();
                let score2 = $(data).find('div.imso_mh__r-tm-sc.imso_mh__scr-it.imso-light-font').last().text();
                let response = `${team1} ${score1} - ${score2} ${team2}`;
                dataReturn.push({
                    key: 'soccer',
                    value: response,
                });
            }

            //Tiền tệ
            let money = $(data).find('span.DFlfde.SwHCTb').text();
            if (money != null && money !== '') {
                money + ' ' + $(data).find('span.MWvIVe').text();
                dataReturn.push({
                    key: 'money',
                    value: money,
                });
            }
            //chuyen doi
            let change_unit = $(data).find('div.dDoNo.vrBOv.vk_bk').text();
            if (change_unit != null && change_unit !== '') {
                dataReturn.push({
                    key: 'change_unit',
                    value: change_unit,
                });
            }
            // tinh toan
            let math = $(data).find('span.qv3Wpe').text();
            if (math != null && math !== '') {
                dataReturn.push({
                    key: 'math',
                    value: math,
                });
            }
            //zipcode
            let zipcode = $(data).find('div.bVj5Zb.FozYP');
            if (zipcode.length > 0) {
                console.log(zipcode.text());
                let msgzipcode: string;
                zipcode.each(function (e, i) {
                    if ($(this).text() != null && $(this).text() !== '') {
                        msgzipcode += $(this).text() + '\n';
                    }
                });
                msgzipcode = msgzipcode.replace(/undefined/g, '');
                dataReturn.push({
                    key: 'zipcode',
                    value: msgzipcode,
                });
            }
            //Khoảng cách
            let far = $(data).find('div.LGOjhe').text();

            if (far != null && far !== '') {
                dataReturn.push({
                    key: 'far',
                    value: far,
                });
            }
            //Ngày thành lập
            let datecreate = $(data).find('div.Z0LcW').text();
            if (datecreate != null && datecreate !== '') {
                dataReturn.push({
                    key: 'datecreate',
                    value: datecreate,
                });
            }
            //Thong tin
            let information = $(data).find('div.kno-rdesc > span').first().text();
            if (information != null && information !== '') {
                dataReturn.push({
                    key: 'information',
                    value: information,
                });
            }
            //dịch
            let trans = $(data).find('div.oSioSc>div>div>div>pre>span').first().text();
            if (trans != null && trans !== '') {
                dataReturn.push({
                    key: 'trans',
                    value: trans,
                });
            }
            //date
            let day = $(data).find('div.FzvWSb').text();
            if (day != null && day !== '') {
                let response = { text: day };
                dataReturn.push({
                    key: 'date',
                    value: response,
                });
            }
            let time = $(data).find('div.YwPhnf').text();
            if (time != null && time !== '') {
                dataReturn.push({
                    key: 'time',
                    value: time,
                });
            }
            //lyric
            // let lyric = $(data).find("div.PZPZlf >div>div > span");
            // let lyricsave;
            // lyric.each(function(i, e) {
            //     lyricsave += $(this).text() + "\n";
            // });
            // console.log(lyricsave);
            // if (lyricsave != null && lyricsave != "") {
            //     let response = { text: lyricsave };
            //    data
            //     return;
            // }
            // return;
            return dataReturn;
        } catch (error) {
            throw error;
        }
    };
    public getYoutube = async (message: string): Promise<any> => {
        //message = @ytb Con gà nhật bản
        let keySearch = message.replace('@ytb ', '');
        return new Promise(async (reslove, reject) => {
            try {
                const videos = await yt.search(keySearch);
                let response = {
                    thumbnail_url: videos[0].snippet.thumbnails.url,
                    title: videos[0].title,
                    url: videos[0].url,
                };
                reslove(response);
            } catch (e) {
                reject(e);
            }
        });
    };
    public stripAccent = (str: string): string => {
        try {
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
            str = str.replace(/đ/g, 'd');
            str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
            str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
            str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
            str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
            str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
            str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
            str = str.replace(/Đ/g, 'D');
            return str;
        } catch (error) {
            return;
        }
    };
    value: any;
    public getLuckyNumber = async (message: string): Promise<any> => {
        //message = @lucky 1 đến 100
        //get min max
        let min = message.replace('@lucky ', '').split(' ')[0];
        let max = message.replace('@lucky ', '').split(' ')[1];
        if (min == null || min == '') {
            min = 1 + '';
        }
        if (max == null || max == '') {
            max = 1000 + '';
        }
        //request axios using User-Agent
        const agent = {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
            },
        };
        const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=10&format=plain&rnd=new`;
        await axios.get(url, agent).then((response) => {
            this.value = response.data;
        });
        return this.value;
    };
    public crawlerXSMB = async (): Promise<any> => {
        try {
            const url = `https://xsmn.me/xsmb-sxmb-kqxsmb-xstd-xshn-ket-qua-xo-so-mien-bac.html`;
            const agent = {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
                },
            };
            const { data } = await axios.get(url, agent);
            const $ = cheerio.load(data);
            let xsmb = $(data).find('table.extendable.kqmb.colgiai').first();
            let msg = '';
            let gdb = $(xsmb).find('span.v-gdb').first().text();
            msg += 'Giải đặc biệt: ' + gdb + '\n';
            let gn = $(xsmb).find('span.v-g1').first().text();
            msg += 'Giải nhất: ' + gn + '\n';
            msg += 'Giải 2: ';
            for (let i = 0; i < 2; i++) {
                msg += $(xsmb).find(`span.v-g2-${i}`).text().trim() + ' ';
            }
            msg += '\nGiải 3: ';
            for (let i = 0; i < 6; i++) {
                msg += $(xsmb).find(`span.v-g3-${i}`).text().trim() + ' ';
            }
            msg += '\nGiải 4: ';
            for (let i = 0; i < 4; i++) {
                msg += $(xsmb).find(`span.v-g4-${i}`).text().trim() + ' ';
            }
            msg += '\nGiải 5: ';
            for (let i = 0; i < 6; i++) {
                msg += $(xsmb).find(`span.v-g5-${i}`).text().trim() + ' ';
            }
            msg += '\nGiải 6: ';
            for (let i = 0; i < 3; i++) {
                msg += $(xsmb).find(`span.v-g6-${i}`).text().trim() + ' ';
            }
            msg += '\nGiải 7: ';
            for (let i = 0; i < 4; i++) {
                msg += $(xsmb).find(`span.v-g7-${i}`).text().trim() + ' ';
            }
            return msg;
        } catch (error) {
            return;
        }
    };
    public crawlerCovid19 = async (message: string): Promise<any> => {
        try {
            let result: any;
            let link: string;
            let getlocation = [];
            let locationsearch: string;
            let arr = [];
            let location = message.toLowerCase();
            //remove all 'nước' using regex
            location = location.replace(/nước/g, '');
            if (message.indexOf('tại') !== -1) {
                getlocation = location.split('tại');
                locationsearch = getlocation[1].trim();
                await translate('nước ' + locationsearch, { to: 'en' })
                    .then((res: string) => {
                        result = res.toLowerCase();
                    })
                    .catch(() => {
                        return;
                    });
            }
            if (message.indexOf('ở') !== -1) {
                getlocation = location.split('ở');
                locationsearch = getlocation[1].trim();
                await translate('nước ' + locationsearch, { to: 'en' })
                    .then((res: string) => {
                        result = res.toLowerCase();
                    })
                    .catch(function (err: any) {
                        console.error(err);
                    });
            }
            let datalocation = require('../datas/listlocation.json');
            let item = datalocation.find((item: any) => item.key === result);
            let href = '';
            if (item !== undefined) {
                href = item.href;
            }
            let sendCheck: number;

            const AXIOS_OPTIONS = {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.57',
                },
            };
            if (href !== '' && href != null) {
                link = `https://www.worldometers.info/coronavirus/${href}`;
                sendCheck = 0;
            } else {
                link = `https://www.worldometers.info/coronavirus/`;
                sendCheck = 1;
            }
            const { data } = await axios.get(`${link}`, AXIOS_OPTIONS);
            let $ = cheerio.load(data);
            let allcase = $(data).find('div.maincounter-number>span');
            allcase.each(function (i, e) {
                arr.push($(this).text());
            });
            let msg = `Số ca mắc: ${arr[0]} \nSố ca tử vong: ${arr[1]}\nSố ca khỏi bệnh: ${arr[2]}`;
            //remove all ',' using regex
            msg = msg.replace(/,/g, '');
            if (sendCheck === 0) {
                return {
                    type: 'single location',
                    location: locationsearch,
                    data: msg,
                };
            }
            if (sendCheck === 1) {
                return {
                    type: 'all location',
                    data: msg,
                };
            }
            return;
        } catch (error) {
            throw error;
        }
    };
    public crawlerFuel = async (): Promise<any> => {
        try {
            const key = '3kd8ub1llcg9t45hnoh8hmn7t5kc2v';
            const url = 'http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=' + key;
            const agent = {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
                },
            };
            const { data } = await axios.get(url, agent);

            let dataGold = data.DataList.Data;
            //get first data
            const dataReturn = [];
            dataReturn.push(dataGold[0]);
            dataReturn.push(dataGold[4]);
            dataReturn.push(dataGold[5]);
            dataReturn.push(dataGold[6]);
            console.log(dataGold[0]);
            return dataReturn;
        } catch (error) {
            return;
        }
    };
}
export default CrawlerService;
