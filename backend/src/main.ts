import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true });

	// Swagger
	const document = SwaggerModule.createDocument(
		app,
		new DocumentBuilder()
			.setTitle("CodePair")
			.setDescription("The CodePair API description")
			.setVersion("1.0")
			.addBearerAuth()
			.build()
	);
	SwaggerModule.setup("api", app, document);

	// Auto Validation
	app.useGlobalPipes(new ValidationPipe({ transform: true }));

	await app.listen(3000);
}
bootstrap();
