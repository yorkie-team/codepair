import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const s3ClientFactory = {
	provide: "STORAGE_CLIENT",
	useFactory: (configService: ConfigService): S3Client | null => {
		const fileUpload = configService.get<boolean | "s3" | "minio">("FILE_UPLOAD");
		if (!fileUpload) {
			return null;
		}
		const region = configService.get<string>("AWS_REGION");
		const endpoint = configService.get<string>("MINIO_ENDPOINT");
		const accessKeyId = configService.get<string>("STORAGE_ACCESS_KEY");
		const secretAccessKey = configService.get<string>("STORAGE_SECRET_KEY");

		const config: S3ClientConfig = {
			region,
			...(fileUpload === "minio" && {
				endpoint,
				forcePathStyle: true,
				credentials: {
					accessKeyId,
					secretAccessKey,
				},
			}),
		};

		return new S3Client(config);
	},
	inject: [ConfigService],
};

@Module({
	providers: [s3ClientFactory],
	exports: [s3ClientFactory],
})
export class StorageModule {}
