import { Router } from 'express';
import IndexController from '@controllers/index.controller';
import { Routes } from '@interfaces/routes.interface';
import MessengerController from '@/controllers/messenger.controller';
import authMiddleware from '@/middlewares/auth.middleware';

class IndexRoute implements Routes {
    public path = '/';
    public router = Router();
    public indexController = new IndexController();
    public messengerController = new MessengerController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, authMiddleware, this.indexController.index);
        this.router.get(`${this.path}update-data`, authMiddleware, this.indexController.updateData);
        this.router.get(`${this.path}webhook`, this.messengerController.getWebhook);
        this.router.post(`${this.path}webhook`, this.messengerController.postWebHook);
        this.router.get(`${this.path}setup-profile`, authMiddleware, this.messengerController.setupProfile);
        this.router.post(`${this.path}get-user`, authMiddleware, this.messengerController.getUserProfile);
        this.router.get(`${this.path}setup-menu`, authMiddleware, this.messengerController.setupMenu);
        this.router.get(`${this.path}update-food`, authMiddleware, this.indexController.updateFood);
        this.router.get(`${this.path}spam`, authMiddleware, this.messengerController.spamMessage);
        this.router.post(`${this.path}send-message`, authMiddleware, this.messengerController.sendSpamMessage);
    }
}

export default IndexRoute;
