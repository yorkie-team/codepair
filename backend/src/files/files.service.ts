import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
	UnprocessableEntityException,
} from "@nestjs/common";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ConfigService } from "@nestjs/config";
import { generateRandomKey } from "src/utils/functions/random-string";
import { PrismaService } from "src/db/prisma.service";
import { Workspace } from "@prisma/client";
import { CreateUploadPresignedUrlResponse } from "./types/create-upload-url-response.type";

@Injectable()
export class FilesService {
	private s3Client: S3Client;

	constructor(
		private configService: ConfigService,
		private prismaService: PrismaService
	) {
		this.s3Client = new S3Client();
	}

	async createUploadPresignedUrl(
		workspaceId: string,
		contentLength: number,
		contentType: string
	): Promise<CreateUploadPresignedUrlResponse> {
		let workspace: Workspace;
		try {
			workspace = await this.prismaService.workspace.findFirstOrThrow({
				where: {
					id: workspaceId,
				},
			});
		} catch (e) {
			throw new UnauthorizedException();
		}

		if (contentLength > 10_000_000) {
			throw new UnprocessableEntityException();
		}

		const fileKey = `${workspace.slug}-${generateRandomKey()}.${contentType.split("/")[1]}`;
		const command = new PutObjectCommand({
			Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
			Key: fileKey,
			StorageClass: "INTELLIGENT_TIERING",
			ContentType: contentType,
			ContentLength: contentLength,
		});
		return {
			fileKey,
			url: await getSignedUrl(this.s3Client, command, { expiresIn: 300 }),
		};
	}

	async createDownloadPresignedUrl(fileKey: string) {
		try {
			const command = new GetObjectCommand({
				Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
				Key: fileKey,
			});
			return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
		} catch (e) {
			throw new NotFoundException();
		}
	}
}
