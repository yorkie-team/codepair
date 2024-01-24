import { ApiProperty } from "@nestjs/swagger";

export class ChangeNicknameDto {
	@ApiProperty({ type: String, description: "Nickname of user to update" })
	nickname: string;
}
