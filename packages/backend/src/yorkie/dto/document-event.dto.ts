import { IsNotEmpty, ValidateNested, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Yorkie Event Webhook Types
 * Reference: yorkie/api/types/event_webhook.go
 */
export enum DocumentEventType {
	// Document's root content was modified
	DocumentRootChanged = "DocumentRootChanged",
}

/**
 * Attributes sent by Yorkie webhook
 */
class EventAttributesDto {
	@ApiProperty({
		description: "Yorkie document key",
		example: "my-document-key",
	})
	@IsString()
	@IsNotEmpty()
	key: string;

	@ApiProperty({
		description: "Timestamp when the event was issued (ISO 8601 format)",
		example: "2026-01-20T12:00:00.000Z",
	})
	@IsString()
	@IsNotEmpty()
	issuedAt: string;
}

/**
 * Document Event from Yorkie Webhook
 * This matches the payload format sent by Yorkie server
 */
export class DocumentEventDto {
	@ApiProperty({
		description: "Type of document event",
		enum: DocumentEventType,
		example: DocumentEventType.DocumentRootChanged,
	})
	@IsString()
	@IsNotEmpty()
	type: DocumentEventType;

	@ApiProperty({
		description: "Event attributes containing document key and timestamp",
		type: EventAttributesDto,
	})
	@ValidateNested()
	@Type(() => EventAttributesDto)
	@IsNotEmpty()
	attributes: EventAttributesDto;
}
