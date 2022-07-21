import Sequelize from 'sequelize';
import { NODE_ENV, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE } from '@config';
import DataModel from '@/models/datas.models';
import BanModel from '@/models/bans.model';
import UserModel from '@/models/users.model';
import FontModel from '@/models/fonts.model';
import ListFontModel from '@/models/list-font.model';
import ConfigModel from '@/models/config.model';
import FoodModel from '@/models/foods.model';

const sequelize = new Sequelize.Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
    dialect: 'mysql',
    host: DB_HOST,
    port: Number(DB_PORT),
    timezone: '+07:00',
    define: {
        charset: 'utf8',
        collate: 'utf8_unicode_ci',
        underscored: true,
        freezeTableName: true,
    },
    pool: {
        min: 0,
        max: 5,
    },
    logQueryParameters: NODE_ENV === 'development',
    logging: false,
    benchmark: true,
});

sequelize.authenticate();

const DB = {
    Users: UserModel(sequelize),
    Bans: BanModel(sequelize),
    Datas: DataModel(sequelize),
    Fonts: FontModel(sequelize),
    ListFonts: ListFontModel(sequelize),
    Foods: FoodModel(sequelize),
    Configs: ConfigModel(sequelize),
    sequelize, // connection instance (RAW queries)
    Sequelize, // library
};

export default DB;
