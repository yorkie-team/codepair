import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { connect } from "http2";
import { ListDocuments, YorkieDocument } from "./types/list-documents.type";
import { FindDocumentFromYorkieResponse } from "src/workspace-documents/types/find-document-from-yorkie-response.type";
import { PrismaService } from "src/db/prisma.service";
import markdownToTxt from "markdown-to-txt";

@Injectable()
export class AdminService {
	constructor(
		private configService: ConfigService,
		private prismaService: PrismaService
	) {}

	private async postHttp2<T>(path: string, requestBody: string) {
		return new Promise<T>((resolve, reject) => {
			const client = connect(`${this.configService.get<string>("YORKIE_API_ADDR")}`);

			client.on("error", (err) => reject(err));

			const req = client.request({
				":method": "POST",
				":path": path,
				"Content-Type": "application/json",
				"content-length": Buffer.byteLength(requestBody),
				Authorization: this.configService.get<string>("YORKIE_PROJECT_SECRET_KEY"),
			});

			req.write(requestBody);
			req.setEncoding("utf8");
			let data = "";

			req.on("data", (chunk) => {
				data += chunk;
			});

			req.on("end", () => {
				client.close();
				resolve(JSON.parse(data) as T);
			});

			req.end();
		});
	}

	async migrateData(
		workspaceSlug: string,
		prevLastDocumentId?: string
	): Promise<Array<YorkieDocument>> {
		let lastDocumentId: string = prevLastDocumentId;
		let mergedDocumentList: Array<YorkieDocument> = [];

		while (true) {
			const pagedDocumentsList = await this.postHttp2<ListDocuments>(
				"/yorkie.v1.AdminService/ListDocuments",
				JSON.stringify({
					project_name: this.configService.get<string>("YORKIE_PROJECT_NAME"),
					page_size: 101,
					previous_id: lastDocumentId,
					// is_forward: true,
				})
			);

			if (pagedDocumentsList.documents?.length) {
				lastDocumentId =
					pagedDocumentsList.documents[pagedDocumentsList.documents.length - 1].id;
			}

			if (!pagedDocumentsList?.documents?.length) {
				break;
			}

			mergedDocumentList = mergedDocumentList.concat(pagedDocumentsList.documents);
		}

		const workspace = await this.prismaService.workspace.findFirstOrThrow({
			where: {
				slug: workspaceSlug,
			},
		});

		let cnt = 0,
			skippedCnt = 0;
		for (const document of mergedDocumentList) {
			const foundDocumentInYorkie = await this.postHttp2<FindDocumentFromYorkieResponse>(
				"/yorkie.v1.AdminService/GetDocument",
				JSON.stringify({
					project_name: this.configService.get<string>("YORKIE_PROJECT_NAME"),
					document_key: document.key,
				})
			);
			if (!foundDocumentInYorkie.document?.snapshot) continue;

			let parsedSnapshot: { content: Array<{ val: string }> };
			try {
				parsedSnapshot = JSON.parse(foundDocumentInYorkie.document.snapshot);

				if (!parsedSnapshot || !parsedSnapshot?.content) continue;
			} catch (err) {
				console.log(err);
				console.log(foundDocumentInYorkie.document);
			}

			const content = parsedSnapshot.content.reduce((prev, cur) => {
				return prev + cur.val;
			}, "");
			const title = markdownToTxt(content.slice(0, 200))
				.trim()
				.slice(0, 50)
				.replaceAll("\n", " ")
				.replace(/\s+/g, " ");

			if (title) {
				console.log(
					`${++cnt}(${skippedCnt} Skipped)`,
					"Doc Key: ",
					document.key,
					", Doc ID: ",
					document.id,
					", Title: ",
					title
				);

				const duplicatedDocument = await this.prismaService.document.findFirst({
					where: {
						workspaceId: workspace.id,
						yorkieDocumentId: document.key,
					},
				});

				if (!duplicatedDocument) {
					await this.prismaService.document.create({
						data: {
							title,
							workspaceId: workspace.id,
							yorkieDocumentId: document.key,
						},
					});
				}
			} else {
				skippedCnt++;
			}
		}

		return mergedDocumentList;
	}
}
