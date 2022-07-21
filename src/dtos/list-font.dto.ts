import { IsString } from 'class-validator';

export class CreateListFontDto {
    @IsString()
    public list: string;
}
