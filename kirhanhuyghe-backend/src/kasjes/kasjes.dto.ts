import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class UpdateKasjeDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  bedrag: number;
}
