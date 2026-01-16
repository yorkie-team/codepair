import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Max } from "class-validator";

export class AnswerDto {
	@IsNotEmpty()
	@IsString()
	workspaceId: string;

	@IsNotEmpty()
	@IsString()
	query: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(20)
	limit?: number = 5;
}
