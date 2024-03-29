import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import DB from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import path from 'path';

class App {
    public app: express.Application;
    public env: string;
    public port: string | number;

    constructor(routes: Routes[]) {
        this.app = express();
        this.env = NODE_ENV || 'development';
        this.port = PORT || 3000;

        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes(routes);
        this.initializeSwagger();
        this.initializeErrorHandling();
        this.intitViewEngine();
    }

    public listen() {
        this.app.listen(this.port, () => {
            logger.info(`=================================`);
            logger.info(`======= ENV: ${this.env} =======`);
            logger.info(`🚀 App listening on the port ${this.port}`);
            logger.info(`=================================`);
        });
    }

    public getServer() {
        return this.app;
    }

    private connectToDatabase() {
        DB.sequelize.sync({ force: false });
    }

    private initializeMiddlewares() {
        //cofig static folder
        this.app.use(express.static(path.join(__dirname, 'public')));
        this.app.use(morgan(LOG_FORMAT, { stream }));
        this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
        this.app.use(hpp());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(
            //"content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self'"

            helmet.contentSecurityPolicy({
                //open all

                useDefaults: true,
                directives: {
                    //accessible to all scripts
                    'img-src': ["'self'", 'https: data:'],
                    'style-src': ["'self'", 'https:', 'http:'],
                    'font-src': ["'self'", 'https:', 'http:'],
                    'frame-src': ["'self'", 'https:', 'http:'],
                    'object-src': ["'self'", 'https:', 'http:'],
                    'connect-src': ["'self'", 'https:', 'http:'],
                    'media-src': ["'self'", 'https:', 'http:'],
                    'frame-ancestors': ["'self'", 'https:', 'http:'],
                    'script-src': ["'self'", 'https:', 'http:', 'unsafe-eval'],
                    //
                },
            }),
        );
    }

    private initializeRoutes(routes: Routes[]) {
        routes.forEach((route) => {
            this.app.use('/', route.router);
        });
    }

    private initializeSwagger() {
        const options = {
            swaggerDefinition: {
                info: {
                    title: 'REST API',
                    version: '1.0.0',
                    description: 'Example docs',
                },
            },
            apis: ['swagger.yaml'],
        };

        const specs = swaggerJSDoc(options);
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    }

    private initializeErrorHandling() {
        this.app.use(errorMiddleware);
    }

    private intitViewEngine() {
        this.app.set('view engine', 'ejs');
        // this.app.set('views', 'views/');
        // set folder for views
        this.app.set('views', path.join(__dirname, 'views'));
    }
}

export default App;
