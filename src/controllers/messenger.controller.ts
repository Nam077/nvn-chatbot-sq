import ConfigService from '@/services/configs.service';
import FontService from '@/services/fonts.service';
import MessengerService from '@/services/messenger.service';
import { NextFunction, Request, Response } from 'express';

class MessengerController {
    public fontService = new FontService();
    public messengerService = new MessengerService();
    public configService = new ConfigService();

    public postWebHook = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const body = req.body;
            // Check the webhook event is from a Page subscription
            if (body.object === 'page') {
                // Iterate over each entry - there may be multiple if batched
                body.entry.forEach(
                    //đưa messengerService vào đây
                    async (entry: any) => {
                        // Gets the body of the webhook event
                        const webhook_event = entry.messaging[0];
                        console.log(webhook_event);

                        // Get the sender PSID
                        const sender_psid = webhook_event.sender.id;
                        console.log('Sender PSID: ' + sender_psid);
                        const checkBan: boolean = await this.messengerService.checkBanUser(sender_psid);
                        console.log('checkBan: ' + checkBan);
                        if (checkBan) {
                            return;
                        } else if (webhook_event.message && webhook_event.message.quick_reply) {
                            this.messengerService.handelQuickReply(sender_psid, webhook_event.message.quick_reply);
                        }
                        if (webhook_event.message) {
                            await this.messengerService.handleMessage(sender_psid, webhook_event.message.text);
                        } else if (webhook_event.postback) {
                            this.messengerService.handlePostback(sender_psid, webhook_event.postback);
                        }
                        //handle quick reply
                    },
                );

                // Return a '200 OK' response to all events
                res.status(200).send('EVENT_RECEIVED');
            } else {
                // Return a '404 Not Found' if event is not from a page subscription
                res.sendStatus(404);
            }
        } catch (error) {
            next(error);
        }
    };
    public getWebhook = (req: Request, res: Response) => {
        let VERIFY_TOKEN = process.env.VERIFY_TOKEN;

        // Parse the query params
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];

        // Checks if a token and mode is in the query string of the request
        if (mode && token) {
            // Checks the mode and token sent is correct
            if (mode === 'subscribe' && token === VERIFY_TOKEN) {
                // Responds with the challenge token from the request
                res.status(200).send(challenge);
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);
            }
        }
    };
    public setupProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.configService.setUpDefaultConfigs();
            await this.messengerService.setUpProfile();
            res.send('oke');
        } catch (error) {
            next(error);
        }
    };
    public setupMenu = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.messengerService.setUpPersistentMenu();
            res.send('oke');
        } catch (error) {
            next(error);
        }
    };
}
export default MessengerController;
