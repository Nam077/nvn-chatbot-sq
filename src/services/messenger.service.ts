import axios from 'axios';
import { Ban } from '@/interfaces/bans.interface';
import BanService from './bans.service';
import ChatService from './chat.service';
import { ListFont } from '@/interfaces/list-fonts.interface';
import { Font } from '@/interfaces/fonts.interface';
import { Data } from '@/interfaces/datas.interface';
import ConfigService from './configs.service';
import FoodService from './foods.service';
import { Food } from '@/interfaces/foods.interface';
import { PaginateData } from './fonts.service';

class MessengerService {
    public banService = new BanService();
    public chatService = new ChatService();
    public configService = new ConfigService();
    public foodService = new FoodService();

    public async handlePostback(sender_psid: string, received_postback: any) {
        try {
            // Get the payload for the postback
            let payload = received_postback.payload;
            // Set the response based on the postback payload
            switch (payload) {
                case 'GET_STARTED':
                case 'GET_STARTED_PAYLOAD':
                case 'RESTART_BOT':
                    await this.sendStart(sender_psid);
                    break;
                case 'LIST_FONT':
                    await this.sendListFont(sender_psid);
                    break;
                case 'PRICE_SERVICE':
                    await this.sendPriceService(sender_psid);
                    break;
                case 'BOT_BUY':
                    await this.sendBuyBot(sender_psid);
                    break;
                case 'BOT_TUTORIAL':
                    await this.sendTutorial(sender_psid);
                    await this.sendVideoTutorial(sender_psid);
                    break;
            }
            if (payload.includes('LIST_FONT_IMAGE_END')) {
                await this.sendListFontEnd(sender_psid);
                return;
            }
            if (payload.includes('LIST_FONT_IMAGE')) {
                // payload LIST_FONT_IMAGE_<page>
                const page = payload.split('_')[3];
                console.log(page);
                await this.sendListFontTemplate(sender_psid, payload);
            }
            const fontCheck: Font[] = await this.chatService.checkFont(payload);
            if (fontCheck.length > 0) {
                let userProfile: any = await this.getUserProfile(sender_psid);
                await this.sendFont(sender_psid, fontCheck, userProfile);
                return;
            }
        } catch (error) {
            return;
        }
    }

    public async handleMessage(sender_psid: string, received_message: any): Promise<void> {
        try {
            let received_message_no_format;
            let userProfile: any = await this.getUserProfile(sender_psid);
            if (received_message) {
                received_message_no_format = received_message;
                received_message = received_message.toLowerCase();
                if (received_message.includes('bắt đầu' || 'khởi động lại')) {
                    await this.sendStart(sender_psid);
                    return;
                }
                const fontCheck: Font[] = await this.chatService.checkFont(received_message);
                if (fontCheck.length > 0) {
                    await this.sendFont(sender_psid, fontCheck, userProfile);
                    return;
                }
                if (received_message.includes('list font' || 'danh sách font' || 'lists font')) {
                    await this.sendListFont(sender_psid);
                    console.log('list font');

                    return;
                }
                if (received_message.includes('@nvn') && sender_psid === process.env.ADMIN_PSID) {
                    const data = await this.chatService.adminFuntion(received_message);
                    await this.sendMessageAdmin(sender_psid, data);
                    console.log('lỗi admin');
                    return;
                }
                if (received_message.includes('@pthh')) {
                    let pthh_result = this.chatService.getPTHH(received_message_no_format);
                    console.log(pthh_result);
                    await this.sendTextMessage(sender_psid, pthh_result);
                    return;
                }

                if (received_message.includes('@ytb')) {
                    const data = await this.chatService.getYtb(received_message);
                    await this.callSendAPI(sender_psid, await this.getTemplateYtb(data));
                    return;
                }
                if (received_message.includes('@qr')) {
                    const data = this.chatService.getQrcode(received_message);
                    await this.callSendAPI(sender_psid, await this.sendImageMessage(sender_psid, data));
                    return;
                }

                if (received_message.includes('ăn gì' || 'an gi')) {
                    const food = await this.foodService.getOneRandom();
                    console.log(food);
                    console.log('lỗi què j v');

                    await this.sendFood(sender_psid, food);
                }
                if (received_message.includes('xsmb' || 'xổ số' || 'xo so')) {
                    await this.sendTextMessage(sender_psid, await this.chatService.getXSMB());
                    return;
                }
                if (received_message.includes('cov' || 'covid' || 'corona' || 'cô vi' || 'corona')) {
                    let covid = await this.chatService.getCovid(received_message);
                    await this.handelCrawlerCovid(sender_psid, covid);
                    return;
                }
                const dataCheck: Data[] = await this.chatService.checkData(received_message);
                if (dataCheck.length > 0) {
                    await this.sendTextMessage(sender_psid, dataCheck[0].response);
                    if (dataCheck[0].image !== '') {
                        await this.sendImageMessage(sender_psid, dataCheck[0].image);
                    }
                    console.log('lỗi data');
                    return;
                } else {
                    await this.handelCrawler(sender_psid, received_message);
                    return;
                }
            }
        } catch (error) {
            return;
        }
    }

    public async handelCrawlerCovid(sender_psid: string, dataCovid: any) {
        try {
            if (dataCovid) {
                await this.sendTextMessage(sender_psid, dataCovid.data);
                if (dataCovid.type === 'all location') {
                    await this.sendTextMessage(
                        sender_psid,
                        'Đây là thông tin covid trên thế giới\nNếu muốn xem thông tin của một quốc gia thì nhắn tin theo cú pháp\ncovid <tên quốc gia>\nVí dụ:',
                    );
                    await this.sendTextMessage(sender_psid, 'Covid tại Việt Nam');
                    return;
                }
                return;
            }
        } catch (error) {
            return;
        }
    }

    public async sendListFontTemplate(sender_psid: string, payload: string) {
        try {
            let page: number = Number(payload.split('_')[3]);
            if (page) {
                page = page;
            } else {
                page = 1;
            }
            const dataPaginate: PaginateData = await this.chatService.getPaginateFont(page, 10);
            if (dataPaginate.allPage < page) {
                await this.sendTextMessage(sender_psid, 'Đã hết danh sách font rồi');
                return;
            }
            const fonts: Font[] = dataPaginate.fonts;
            await this.sendGenericMessage(sender_psid, this.getTemplateFontMulti(fonts));
            await this.callSendAPI(sender_psid, await this.sendButtonListFontImage(page + 1));
            return;
        } catch (error) {
            return;
        }
    }

    public async sendListFontEnd(sender_psid: string) {
        try {
            const endPage = await this.chatService.getEndPageFont(10);
            const dataPaginate: PaginateData = await this.chatService.getPaginateFont(endPage, 10);
            let fonts: Font[] = dataPaginate.fonts;
            fonts = fonts.reverse();
            await this.sendGenericMessage(sender_psid, this.getTemplateFontMulti(fonts));
            return;
        } catch (error) {
            return;
        }
    }

    public async sendButtonListFontImage(page: number) {
        return {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'button',
                    text: 'Chọn chức năng',
                    buttons: [
                        {
                            type: 'postback',
                            title: 'Xem trang tiếp theo',
                            payload: 'LIST_FONT_IMAGE_' + page,
                        },
                        {
                            type: 'postback',
                            title: 'Xem font mới nhất',
                            payload: 'LIST_FONT_IMAGE_END',
                        },
                    ],
                },
            },
        };
    }

    public getTemplateFontMulti(fonts: Font[]) {
        let elements: any[] = [];
        fonts.forEach((font: Font) => {
            elements.push({
                title: font.name,
                image_url: font.image || 'https://picsum.photos/600/40' + Math.floor(Math.random() * 10),
                subtitle: 'Font ' + font.name,
                default_action: {
                    type: 'web_url',
                    url: font.post_link || 'fb.com/nvnfont',
                    webview_height_ratio: 'tall',
                },
                buttons: [
                    {
                        type: 'postback',
                        title: 'Tải xuống',
                        payload: font.key,
                    },
                ],
            });
        });
        return elements;
    }

    public async getTemplateYtb(data: any) {
        try {
            return {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'generic',
                        elements: [
                            {
                                title: `${data.title}`,
                                subtitle: 'Chúc bạn nghe nhạc vui vẻ',
                                image_url: data.thumbnail_url,
                                buttons: [
                                    {
                                        type: 'web_url',
                                        url: data.url,
                                        title: 'Xem ngay',
                                    },
                                ],
                            },
                        ],
                    },
                },
            };
        } catch (error) {
            return;
        }
    }

    public async sendFood(sender_psid: string, food: Food) {
        try {
            await this.sendTextMessage(sender_psid, food.name);
            await this.sendImageMessage(sender_psid, food.image);
            await this.sendTextMessage(sender_psid, food.description);
            await this.sendTextMessage(sender_psid, food.recipe);
            return;
        } catch (error) {
            return;
        }
    }

    public getStartedQuickReplies(): any {
        try {
            return [
                {
                    content_type: 'text',
                    title: 'Mua tổng hợp font',
                    payload: 'BOT_BUY',
                },
                {
                    content_type: 'text',
                    title: 'HD Sử dụng',
                    payload: 'BOT_TUTORIAL',
                },
                {
                    content_type: 'text',
                    title: 'List font hỗ trợ',
                    payload: 'LIST_FONT',
                },
                {
                    content_type: 'text',
                    title: 'Giá việt hoá',
                    payload: 'PRICE_SERVICE',
                },
                {
                    content_type: 'text',
                    title: 'Xem danh sách font có hình ảnh',
                    payload: 'LIST_FONT_IMAGE',
                },
            ];
        } catch (error) {
            return;
        }
    }

    //handel quick reply
    public async handelQuickReply(sender_psid: string, received_message: any) {
        try {
            let payload = received_message.payload;
            console.log(payload);
            switch (payload) {
                case 'BOT_BUY':
                    await this.sendBuyBot(sender_psid);
                    break;
                case 'BOT_TUTORIAL':
                    await this.sendTutorial(sender_psid);
                    await this.sendVideoTutorial(sender_psid);

                    break;
                case 'LIST_FONT':
                    await this.sendListFont(sender_psid);
                    break;
                case 'PRICE_SERVICE':
                    await this.sendPriceService(sender_psid);
                    break;
                case 'LIST_FONT_IMAGE':
                    await this.sendListFontTemplate(sender_psid, payload);
                    break;
            }
        } catch (error) {
            return;
        }
    }

    public async sendTutorial(sender_psid: string) {
        try {
            await this.sendTextMessage(
                sender_psid,
                'Vui lòng gửi tên font bạn cần tìm vào đây\nNếu không có bot sẽ không phản hồi!',
            );
            await this.sendTextMessage(
                sender_psid,
                'Nếu bạn muốn nhận hướng dẫn đầy đủ vui lòng gửi lại tin nhắn "HDSD"',
            );
        } catch (error) {
            return;
        }
    }

    public async sendVideoTutorial(sender_psid: string) {
        try {
            await this.callSendAPI(sender_psid, {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'media',
                        elements: [
                            {
                                media_type: 'video',
                                url: 'https://business.facebook.com/nam077.official/videos/646647483033924/',
                            },
                        ],
                    },
                },
            });
        } catch (error) {
            return;
        }
    }

    public async sendQuickReplies(sender_psid: string, text: string, quickReplies: any) {
        try {
            // Create the payload for a basic text message
            let response = {
                text,
                quick_replies: quickReplies,
            };
            await this.callSendAPI(sender_psid, response);
        } catch (error) {
            return;
        }
    }

    public async sendTextMessage(sender_psid: string, text: string) {
        try {
            // Create the payload for a basic text message
            let response = {
                text: text,
            };
            await this.callSendAPI(sender_psid, response);
        } catch (error) {
            return;
        }
    }

    public async handelCrawler(sender_psid: string, received_message: any) {
        const data = await this.chatService.getCrawler(received_message);
        if (data.length > 0) {
            await this.sendTextMessage(sender_psid, data[0].value);
        } else if (data.length < 1) {
            if (
                received_message.includes('thời tiết') ||
                received_message.includes('thoi tiet') ||
                (received_message.includes('weather') && !received_message.includes('dịch'))
            ) {
                await this.sendTextMessage(
                    sender_psid,
                    'Nếu bạn muốn xem thông tin thời tiết thì nhắn tin theo cú pháp: ',
                );
                await this.sendTextMessage(sender_psid, 'thời tiết tại <tỉnh/thành phố>');
                await this.sendTextMessage(sender_psid, 'ví dụ: thời tiết tại Đà Nẵng');
            }
        }
    }

    public async sendImageMessage(sender_psid: string, image_url: string) {
        // Create the payload for a basic text message
        try {
            let response = {
                attachment: {
                    type: 'image',
                    payload: {
                        url: image_url,
                    },
                },
            };
            await this.callSendAPI(sender_psid, response);
        } catch (error) {
            return;
        }
    }

    public async sendButtonMessage(sender_psid: string, text: string, buttons: any) {
        // Create the payload for a basic text message
        try {
            let response = {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'button',
                        text: text,
                        buttons: buttons,
                    },
                },
            };
            await this.callSendAPI(sender_psid, response);
        } catch (error) {
            return;
        }
    }

    public async sendGenericMessage(sender_psid: string, elements: any) {
        // Create the payload for a basic text message
        try {
            let response = {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'generic',
                        elements: elements,
                    },
                },
            };
            await this.callSendAPI(sender_psid, response);
        } catch (error) {
            return;
        }
    }

    public async sendQuickReply(sender_psid: string, text: string, quick_replies: any) {
        // Create the payload for a basic text message
        try {
            let response = {
                text: text,
                quick_replies: quick_replies,
            };
            await this.callSendAPI(sender_psid, response);
        } catch (error) {
            return;
        }
    }

    public async sendListMessage(sender_psid: string, text: string, elements: any) {
        // Create the payload for a basic text message
        try {
            let response = {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'list',
                        text: text,
                        elements: elements,
                    },
                },
            };
            await this.callSendAPI(sender_psid, response);
        } catch (error) {
            return;
        }
    }

    public async sendListTemplate(sender_psid: string, elements: any) {
        // Create the payload for a basic text message
        let response = {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'list',
                    elements: elements,
                },
            },
        };
        await this.callSendAPI(sender_psid, response);
    }

    public async sendButtonTemplate(sender_psid: string, text: string, buttons: any) {
        // Create the payload for a basic text message
        let response = {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'button',
                    text: text,
                    buttons: buttons,
                },
            },
        };
        await this.callSendAPI(sender_psid, response);
    }

    public async callSendAPI(sender_psid: string, response: any) {
        try {
            await this.sendRead(sender_psid);
            await this.sendTypingOn(sender_psid);
            return new Promise(async (resolve, reject) => {
                //using axios to send message to facebook
                await axios
                    .post(
                        'https://graph.facebook.com/v9.0/me/messages',
                        {
                            recipient: {
                                id: sender_psid,
                            },
                            message: response,
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + process.env.PAGE_ACCESS_TOKEN,
                            },
                        },
                    )
                    .then(async (res) => {
                        await this.sendTypingOff(sender_psid);
                        resolve('Gửi tin nhắn thành công');
                    })
                    .catch((err) => {
                        resolve('Gửi tin nhắn thất bại');
                    })
                    .finally(() => {
                        console.log('Gửi tin nhắn thành công');
                    });
            });
        } catch (error) {
            return;
        }
    }

    public async sendTypingOn(sender_psid: string) {
        //using axios to send message to facebook
        try {
            return new Promise(async (resolve, reject) => {
                await axios
                    .post(
                        'https://graph.facebook.com/v9.0/me/messages',
                        {
                            recipient: {
                                id: sender_psid,
                            },
                            sender_action: 'typing_on',
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + process.env.PAGE_ACCESS_TOKEN,
                            },
                        },
                    )
                    .then((res) => {
                        resolve('Gửi tin nhắn thành công');
                    })
                    .catch((err) => {
                        resolve('Gửi tin nhắn thất bại');
                    })
                    .finally(() => {
                        console.log('Gửi tin nhắn thành công');
                    });
            });
        } catch (error) {
            return;
        }
    }

    public async sendTypingOff(sender_psid: string) {
        //using axios to send message to facebook
        try {
            return new Promise(async (resolve, reject) => {
                await axios
                    .post(
                        'https://graph.facebook.com/v9.0/me/messages',
                        {
                            recipient: {
                                id: sender_psid,
                            },
                            sender_action: 'typing_off',
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + process.env.PAGE_ACCESS_TOKEN,
                            },
                        },
                    )
                    .then((res) => {
                        resolve('Gửi tắt đang nhập thành công');
                    })
                    .catch((err) => {
                        resolve('Gửi tắt đang nhập thất bại');
                    })
                    .finally(() => {
                        console.log('Gửi tin nhắn thành công');
                    });
            });
        } catch (error) {
            return;
        }
    }

    public async sendRead(sender_psid: string) {
        //using axios to send message to facebook
        try {
            return new Promise(async (resolve, reject) => {
                await axios
                    .post(
                        'https://graph.facebook.com/v9.0/me/messages',
                        {
                            recipient: {
                                id: sender_psid,
                            },
                            sender_action: 'mark_seen',
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + process.env.PAGE_ACCESS_TOKEN,
                            },
                        },
                    )
                    .then((res) => {
                        resolve('Gửi đọc tin thành công');
                    })
                    .catch((err) => {
                        resolve('Gửi đọc tin thất bại');
                    })
                    .finally(() => {
                        console.log('Gửi tin nhắn thành công');
                    });
            });
        } catch (error) {
            return;
        }
    }

    public async getUserProfile(sender_psid: string): Promise<any> {
        //using axios to send message to facebook get name, profile_pic, first_name, last_name from ?fields=first_name,last_name,profile_pic
        try {
            return new Promise(async (resolve, reject) => {
                try {
                    await axios
                        .get(
                            'https://graph.facebook.com/v9.0/' +
                                sender_psid +
                                '?fields=first_name,last_name,profile_pic,name',
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: 'Bearer ' + process.env.PAGE_ACCESS_TOKEN,
                                },
                            },
                        )
                        .then((res) => {
                            // return res.data;
                            resolve(res.data);
                        })
                        .catch((err) => {
                            resolve(undefined);
                        });
                } catch (error) {}
            });
        } catch (error) {
            return;
        }
    }

    public async sendMessageAdmin(sender_psid: string, data: any) {
        try {
            if (data.function.includes('setConfig')) {
                await this.sendTextMessage(sender_psid, data.message);
                return;
            }
            if (data.function.includes('Unban')) {
                if (data.value === 'success') {
                    const userProfile: any = await this.getUserProfile(data.psid);
                    if (userProfile !== undefined) {
                        let message: string = `Tài khoản ${userProfile.name} đã được mở khoá`;
                        await this.sendTextMessage(sender_psid, message);
                        await this.sendTextMessage(sender_psid, data.psid);
                        await this.sendTextMessage(data.psid, message);
                        return;
                    } else {
                        let message: string = `Tài khoản ${data.psid} đã được xoá`;
                        await this.sendTextMessage(sender_psid, message);
                    }
                }
                if (data.value === 'error') {
                    await this.sendTextMessage(sender_psid, data.message);
                    return;
                }
                if (data.value === 'multiple') {
                    await this.sendTextMessage(sender_psid, data.message);
                    return;
                }
            }
            if (data.function.includes('Ban-Psid')) {
                if (data.value === 'success') {
                    const userProfile: any = await this.getUserProfile(data.psid);
                    console.log(userProfile);
                    if (userProfile !== undefined) {
                        let message: string = `Tài khoản ${userProfile.name} đã được khóa`;
                        const banUpdate: Ban = {
                            psid: data.psid,
                            name: userProfile.name,
                        };
                        await this.banService.updateByPsid(data.psid, banUpdate);
                        await this.sendTextMessage(sender_psid, message);
                    } else {
                        let message: string = `Tài khoản có ${data.psid} không tìm thấy`;
                        await this.banService.deleteByPsid(data.psid);
                        await this.sendTextMessage(sender_psid, message);
                    }
                    return;
                }
                if (data.value === 'duplicate') {
                    const userProfile: any = await this.getUserProfile(data.psid);
                    let message: string = `Tài khoản ${userProfile.name} đã bị chặn trước đó`;
                    await this.sendTextMessage(sender_psid, message);
                    return;
                }
            }
            if (data.function.includes('BanList')) {
                const dataList = data.data;
                for (let i = 0; i < dataList.length; i++) {
                    await this.sendTextMessage(sender_psid, dataList[i]);
                }
                return;
            }
            return;
        } catch (error) {
            return;
        }
    }

    public async sendListFont(sender_psid: string): Promise<void> {
        try {
            const listFont: ListFont[] = await this.chatService.getListFont();
            for (let i = 0; i < listFont.length; i++) {
                await this.sendTextMessage(sender_psid, listFont[i].list);
            }
            await this.sendTextMessage(
                sender_psid,
                'Nếu bạn muốn lấy link nào thì nhắn tin tên một font trong list này\nHệ thống sẽ gửi cho bạn',
            );
            return;
        } catch (error) {
            return;
        }
    }

    public async sendFont(sender_psid: string, fontCheck: Font[], userProfile: any) {
        try {
            const configFontList = await this.configService.getByKey('FontList');
            const valueConfigFontList = configFontList.value;
            console.log(valueConfigFontList);

            if (fontCheck.length > 1 && valueConfigFontList.includes('true')) {
                const dataSend: string[] = this.chatService.getDataMessage(fontCheck);
                for (let i = 0; i < dataSend.length; i++) {
                    await this.sendTextMessage(sender_psid, dataSend[i]);
                }
            } else {
                const fontSingle: Font = fontCheck[0];
                await this.sendSingleFont(sender_psid, fontSingle, userProfile);
            }
            return;
        } catch (error) {
            return;
        }
    }

    public async sendSingleFont(sender_psid: string, fontSingle: Font, userProfile: any) {
        try {
            await this.sendImageMessage(sender_psid, fontSingle.image);
            const data = this.getResponseFont(sender_psid, fontSingle, userProfile);
            let response: any = data;
            await this.callSendAPI(sender_psid, response);
            return;
        } catch (error) {
            return;
        }
    }

    public getResponseFont(sender_psid: string, font: Font, userProfile: any): any {
        try {
            let message = `Chào ${userProfile.name}\nTôi đã nhận được yêu cầu từ bạn\nTên font: ${
                font.name
            }\nLink download: ${font.link}\n${font.message.trim()}\nCode: ${sender_psid}\n#NVNFONT`;
            return {
                attachment: {
                    type: 'template',
                    payload: {
                        template_type: 'button',
                        text: message,
                        buttons: [
                            {
                                type: 'web_url',
                                url: font.link,
                                title: 'Tải xuống',
                            },
                            {
                                type: 'postback',
                                title: 'Danh sách font hỗ trợ',
                                payload: 'LIST_FONT',
                            },
                        ],
                    },
                },
            };
        } catch (error) {
            return;
        }
    }

    public async sendBuyBot(sender_psid: string) {
        await this.sendTextMessage(
            sender_psid,
            'Hiện tại bên mình đang bạn với giá 1 font là 1000đ\nNếu bạn muốn mua thì liên hệ với fb.com/nam077.me',
        );
    }

    public async sendPriceService(sender_psid: string) {
        await this.sendTextMessage(sender_psid, 'Hiện tại bên mình đang nhận việt hoá font với giá là 50 000đ / font');
        await this.sendTextMessage(sender_psid, 'Nếu bạn muốn liên hệ để việt hoá thì nhắn tin qua\nfb.com/nam077me');
        return;
    }

    public async sendStart(sender_psid: string) {
        try {
            const userProfile: any = await this.getUserProfile(sender_psid);

            await this.sendGreeting(sender_psid, userProfile.name);
            await this.sendTextMessage(sender_psid, sender_psid);
            await this.sendImageMessage(
                sender_psid,
                'https://i.pinimg.com/originals/e0/bf/18/e0bf18ff384586f1b0c1fe7105e859b1.gif',
            );
            await this.sendQuickReplies(sender_psid, 'Bạn cần mình giúp gì không?', this.getStartedQuickReplies());
        } catch (error) {
            return;
        }
    }

    public async sendGreeting(sender_psid: string, name: string) {
        try {
            let timeNow = new Date();
            let timeNowVN = timeNow.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
            let hour = +timeNowVN.split(':')[0];
            if (hour >= 5 && hour < 10) {
                await this.sendTextMessage(sender_psid, `Chào ${name}, Chúc bạn một ngày tốt lành!`);
            } else if (hour >= 10 && hour <= 12) {
                await this.sendTextMessage(sender_psid, `Chào ${name}, Bạn ăn trưa chưa?`);
            } else if (hour > 12 && hour < 18) {
                await this.sendTextMessage(sender_psid, `Chào ${name}, Chúc bạn buổi chiều vui vẻ?`);
            } else if (hour >= 18 && hour < 22) {
                await this.sendTextMessage(sender_psid, `Chào ${name}, Chúc bạn buổi tối vui vẻ?`);
            } else if (hour >= 22 && hour < 24) {
                await this.sendTextMessage(sender_psid, `Chào ${name}, Khuya rồi bạn nên ngủ đi nhé!`);
            } else if (hour >= 0 && hour < 5) {
                await this.sendTextMessage(
                    sender_psid,
                    `Chào ${name}, Nếu bạn nhắn tin giờ này thì đang làm phiền mình đây không nên nhé!`,
                );
            }
        } catch (error) {
            return;
        }
    }

    public async setUpPersistentMenu() {
        //using axios to send message to facebook
        try {
            axios
                .post(
                    'https://graph.facebook.com/v9.0/me/messenger_profile',
                    {
                        persistent_menu: [
                            {
                                locale: 'default',
                                composer_input_disabled: false,
                                call_to_actions: [
                                    {
                                        type: 'postback',
                                        title: 'Khởi động lại bot',
                                        payload: 'RESTART_BOT',
                                    },
                                    {
                                        type: 'postback',
                                        title: 'Mua tổng hợp của NVN',
                                        payload: 'BOT_BUY',
                                    },
                                    {
                                        type: 'postback',
                                        title: 'Xem các font mới nhất',
                                        payload: 'LIST_FONT_IMAGE_END',
                                    },
                                    {
                                        type: 'postback',
                                        title: 'Danh sách font hỗ trợ',
                                        payload: 'LIST_FONT',
                                    },
                                    {
                                        type: 'postback',
                                        title: 'Xem Demo Danh Sách Font',
                                        payload: 'LIST_FONT_IMAGE',
                                    },
                                    {
                                        type: 'web_url',
                                        title: 'Tham gia group',
                                        url: 'https://www.facebook.com/groups/NVNFONT/',
                                        webview_height_ratio: 'full',
                                    },
                                    {
                                        type: 'postback',
                                        title: 'Xem hướng dẫn sử dụng bot',
                                        payload: 'BOT_TUTORIAL',
                                    },
                                    {
                                        type: 'postback',
                                        title: 'Xem giá Việt hóa',
                                        payload: 'PRICE_SERVICE',
                                    },
                                    {
                                        type: 'web_url',
                                        title: 'Xem Trang',
                                        url: 'https://www.facebook.com/NVNFONT/',
                                        webview_height_ratio: 'full',
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + process.env.PAGE_ACCESS_TOKEN,
                        },
                    },
                )
                .then((res) => {
                    console.log('Gửi trạng thái đang nhập thành công');
                })
                .catch((err) => {
                    console.log('Gửi trạng thái đang nhập thất bại');
                });
        } catch (error) {
            return;
        }
    }

    public async setUpProfile() {
        //using axios to send message to facebook
        try {
            return new Promise(async (resolve, reject) => {
                await axios
                    .post(
                        'https://graph.facebook.com/v9.0/me/messenger_profile',
                        {
                            greeting: [
                                {
                                    locale: 'default',
                                    text: 'Xin chào bạn đã đến với NVN Font! bạn có thể gửi tin nhắn cho NVN Font để sử dụng bot một cách miễn phí!',
                                },
                                {
                                    locale: 'en_US',
                                    text: 'Hi, welcome to NVN Font! You can send message to NVN Font to use bot for free!',
                                },
                            ],
                            get_started: {
                                payload: 'GET_STARTED_PAYLOAD',
                            },
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + process.env.PAGE_ACCESS_TOKEN,
                            },
                        },
                    )
                    .then((res) => {
                        resolve('Cài đặt thông tin thành công');
                    })
                    .catch((err) => {
                        resolve('Cài đặt thông tin thất bại');
                    });
            });
        } catch (error) {
            return;
        }
    }

    public async checkBanUser(sender_psid: string): Promise<boolean> {
        try {
            let timeNow = new Date();
            let timeNowVN = timeNow.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
            let hour = timeNowVN.split(':')[0];
            if (sender_psid === process.env.ADMIN_PSID) {
                return false;
            } else {
                const banUser: Ban = await this.banService.getOneByPsid(sender_psid);
                if (banUser) {
                    await this.callSendAPI(sender_psid, {
                        text: `Bạn đã bị cấm chat\nLý do: ${banUser.reason}\nVui lòng liên hệ fb.com/nam077.me để biết thêm chi tiết`,
                    });
                    await this.sendTextMessage(sender_psid, sender_psid);
                    return true;
                } else {
                    const checkBan: string = (await this.configService.getByKey('Ban')).value;
                    if ((+hour < 5 || +hour > 23) && checkBan.includes('true')) {
                        const userProfile = await this.getUserProfile(sender_psid);
                        const checkBan = await this.banService.getOneByPsid(sender_psid);
                        if (checkBan) {
                            await this.callSendAPI(sender_psid, {
                                text: `Bạn đã bị cấm vào thời điểm này\n\nLý do: ${checkBan.reason}\n\nVui lòng liên hệ fb.com/nam077.me \n\nĐể biết thêm chi tiết`,
                            });
                            await this.sendTextMessage(sender_psid, sender_psid);
                            return true;
                        } else {
                            const reason = 'Nhắn tin sai thời gian cho phép';
                            const ban: Ban = {
                                psid: sender_psid,
                                name: userProfile.name,
                                reason: reason,
                            };
                            await this.banService.create(ban);
                            await this.callSendAPI(sender_psid, {
                                text: `Bạn đã bị cấm vào thời điểm này\n\nLý do: ${reason}\n\nVui lòng liên hệ fb.com/nam077.me \n\nĐể biết thêm chi tiết`,
                            });
                            await this.sendTextMessage(sender_psid, sender_psid);
                            return true;
                        }
                    } else {
                        return false;
                    }
                }
            }
        } catch (error) {
            return false;
        }
    }
}

export default MessengerService;
