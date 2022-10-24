import { IsString } from 'class-validator';

export class CreateFontDto {
    @IsString()
    public name: string;

    @IsString()
    public key: string;

    @IsString()
    public link: string;

    @IsString()
    public image: string;

    @IsString()
    public message: string;

    @IsString()
    public post_link: string;
}
