import {Food} from '@/interfaces/foods.interface';
import {ListFont} from '@/interfaces/list-fonts.interface';
import ChatService from '@/services/chat.service';
import ConfigService from '@/services/configs.service';
import DataService from '@/services/datas.service';
import FontService from '@/services/fonts.service';
import GoogleService from '@/services/crawler.service';
import ListFontService from '@/services/list-font.service';
import MessengerService from '@/services/messenger.service';
import SheetService from '@/services/sheet.service';
import {NextFunction, Request, Response} from 'express';
import CrawlerService from '@/services/crawler.service';
import FoodService from '@/services/foods.service';
import {pthh} from '@services/balance-the-chemical-equation.service';

class IndexController {
  public fontService = new FontService();
  public sheetService = new SheetService();
  public dataService = new DataService();
  public listFontService = new ListFontService();
  public messengerService = new MessengerService();
  public configService = new ConfigService();
  public chatService = new ChatService();
  public googleService = new GoogleService();
  public crawlerService = new CrawlerService();
  public foodService = new FoodService();
  public index = async (req: Request, res: Response, next: NextFunction) => {
    res.render('homepage.ejs');
  };

  public updateFood = async (req: Request, res: Response, next: NextFunction) => {
    const foods = require('../datas/food.json');
    const foodsSplit: Food[][] = [];
    for (let i = 0; i < foods.length; i += 300) {
      foodsSplit.push(foods.slice(i, i + 300));
    }
    await this.foodService.deleteAll();
    for (let i = 0; i < foodsSplit.length; i++) {
      await this.foodService.createMultiple(foodsSplit[i]);
    }
    res.redirect('/');
  };
  public updateData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataExel = await this.sheetService.getDatas();
      const fonts = dataExel.fonts;
      const datas = dataExel.datas;
      const fontsCreated = await this.fontService.createMultiple(fonts);
      const datasCreated = await this.dataService.createMultiple(datas);
      const listFont: ListFont[] = this.fontService.getList(fonts, 15);
      const listFontCreated = await this.listFontService.createMultiple(listFont);
      res.redirect('/');
    } catch (error) {
      next(error);
    }
  };
  public test = async (req: Request, res: Response, next: NextFunction) => {
    return res.json(this.chatService.getPTHH('@pthh C2H4	+	H2O	+	KMnO4	⟶	KOH	+	MnO2	+	C2H4(OH)2'));
  };
}

//

export default IndexController;
