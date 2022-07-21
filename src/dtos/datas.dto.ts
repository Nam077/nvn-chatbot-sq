import { IsString } from 'class-validator';

export class CreateDataDto {
    @IsString()
    public key: string;

    @IsString()
    public response: string;

    @IsString()
    public image: string;
}
//update data extends create data
