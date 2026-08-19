import { IsIn, IsOptional, IsString, ValidateIf } from 'class-validator';
import { MessageType } from '../../generated/prisma/enums';

// TEMPLATE isn't sendable directly yet — that needs template rendering,
// which lands with Phase 7.
const SENDABLE_TYPES = [
  MessageType.TEXT,
  MessageType.IMAGE,
  MessageType.VIDEO,
  MessageType.AUDIO,
  MessageType.DOCUMENT,
] as const;

export class SendMessageDto {
  @IsIn(SENDABLE_TYPES)
  type!: (typeof SENDABLE_TYPES)[number];

  @ValidateIf((dto: SendMessageDto) => dto.type === MessageType.TEXT)
  @IsString()
  content?: string;

  @ValidateIf((dto: SendMessageDto) => dto.type !== MessageType.TEXT)
  @IsString()
  mediaId?: string;

  @IsOptional()
  @ValidateIf((dto: SendMessageDto) => dto.type !== MessageType.TEXT)
  @IsString()
  caption?: string;
}
