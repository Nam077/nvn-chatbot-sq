import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { CreateUserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import authLoginMiddleware from '@/middlewares/authlogin.middleware';

class AuthRoute implements Routes {
    public path = '/';
    public router = Router();
    public authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // this.router.post(
        //     `${this.path}signup`,
        //     authLoginMiddleware,
        //     validationMiddleware(CreateUserDto, 'body'),
        //     this.authController.signUp,
        // );
        this.router.post(
            `${this.path}login`,
            authLoginMiddleware,
            validationMiddleware(CreateUserDto, 'body'),
            this.authController.logIn,
        );
        this.router.post(`${this.path}logout`, authMiddleware, this.authController.logOut);
        this.router.get(`${this.path}logout`, this.authController.logOutGet);
        this.router.get(`${this.path}signin`, authLoginMiddleware, this.authController.getLogin);
    }
}

export default AuthRoute;
