import { Module } from "@nestjs/common";
import { DocumentsController } from "./documents.controller";
import { DocumentsService } from "./documents.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/db/prisma.service";

@Module({
	imports: [
		JwtModule.registerAsync({
			useFactory: async (configService: ConfigService) => {
				return {
					secret: configService.get<string>("JWT_SHARING_SECRET"),
				};
			},
			inject: [ConfigService],
		}),
	],
	controllers: [DocumentsController],
	providers: [DocumentsService, PrismaService],
})
export class DocumentsModule {}
