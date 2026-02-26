import { ApiProperty } from "@nestjs/swagger";
import { MinLength } from "class-validator";

export class ChangeNicknameDto {
	@ApiProperty({ type: String, description: "Nickname of user to update", minLength: 2 })
	@MinLength(2)
	nickname: string;
}
