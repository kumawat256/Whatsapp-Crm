import { IsBoolean } from 'class-validator';

export class ToggleServiceDto {
  @IsBoolean()
  enabled!: boolean;
}
