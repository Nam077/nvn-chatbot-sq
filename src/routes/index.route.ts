import { Router } from 'express';
import IndexController from '@controllers/index.controller';
import { Routes } from '@interfaces/routes.interface';
import MessengerController from '@/controllers/messenger.controller';

class IndexRoute implements Routes {
    public path = '/';
    public router = Router();
    public indexController = new IndexController();
    public messengerController = new MessengerController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.indexController.index);
        this.router.get(`${this.path}update-data`, this.indexController.updateData);
        this.router.get(`${this.path}webhook`, this.messengerController.getWebhook);
        this.router.post(`${this.path}webhook`, this.messengerController.postWebHook);
        this.router.get(`${this.path}setup-profile`, this.messengerController.setupProfile);
        this.router.get(`${this.path}setup-menu`, this.messengerController.setupMenu);
        this.router.get(`${this.path}update-food`, this.indexController.updateFood);
    }
}

export default IndexRoute;
