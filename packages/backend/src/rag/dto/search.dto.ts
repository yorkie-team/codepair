import { IsNotEmpty, IsString, IsOptional, IsInt, Min, Max } from "class-validator";

export class SearchDto {
	@IsNotEmpty()
	@IsString()
	workspaceId: string;

	@IsNotEmpty()
	@IsString()
	query: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Max(50)
	limit?: number = 10;
}
