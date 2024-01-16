import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
	@ApiProperty({ description: "idToken from Firebase" })
	idToken: string;
	@ApiProperty({ description: "nickname of user to create" })
	nickname: string;
}
