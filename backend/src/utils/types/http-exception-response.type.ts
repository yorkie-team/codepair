import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export class HttpExceptionResponse {
	@ApiProperty({ enum: HttpStatus, description: "Status Code of HTTP Response" })
	statusCode: HttpStatus;
	@ApiProperty({ type: String, description: "Description about the error" })
	message: string;
}
