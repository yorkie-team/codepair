import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost, PresignedPostOptions } from "@aws-sdk/s3-presigned-post";
import { ConfigService } from "@nestjs/config";
import { generateRandomKey } from "src/utils/functions/random-string";
import { PrismaService } from "src/db/prisma.service";
import { Workspace } from "@prisma/client";

@Injectable()
export class FilesService {
	private s3Client: S3Client;

	constructor(
		private configService: ConfigService,
		private prismaService: PrismaService
	) {
		this.s3Client = new S3Client();
	}

	async createUploadPresignedUrl(workspaceId: string) {
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

		const options: PresignedPostOptions = {
			Bucket: this.configService.get("AWS_S3_BUCKET_NAME"),
			Key: `${workspace.slug}-${generateRandomKey()}`,
			Conditions: [
				["content-length-range", 0, 10_000_000], // 10MB
				["starts-with", "$Content-Type", "image/"], // only image'
				["eq", "x-amz-storage-class", "INTELLIGENT_TIERING"],
			],
			Expires: 300,
		};
		const { url } = await createPresignedPost(this.s3Client, options);

		return url;
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
