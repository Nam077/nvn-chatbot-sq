import { IsString } from 'class-validator';

export class BanCreateDto {
    @IsString()
    public psid: string;

    @IsString()
    public name: string;

    @IsString()
    public reson: string;
}
