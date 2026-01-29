import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { connect } from "http2";
import { YorkieDocument } from "./types/yorkie-document.type";

@Injectable()
export class YorkieAdminService {
	private readonly logger = new Logger(YorkieAdminService.name);

	constructor(private configService: ConfigService) {}

	/**
	 * Get a single document from Yorkie Admin API
	 * @param documentKey - Yorkie document key
	 * @returns Yorkie document with content
	 */
	async getDocument(documentKey: string): Promise<YorkieDocument> {
		this.logger.log(`Fetching Yorkie document: ${documentKey}`);

		return new Promise((resolve, reject) => {
			const TIMEOUT_MS = 30000;
			const apiAddr = this.configService.get<string>("YORKIE_API_ADDR");
			const secretKey = this.configService.get<string>("YORKIE_PROJECT_SECRET_KEY");

			if (!apiAddr || !secretKey) {
				reject(new Error("YORKIE_API_ADDR or YORKIE_PROJECT_SECRET_KEY not configured"));
				return;
			}
			const client = connect(apiAddr);

			client.on("error", (err) => {
				clearTimeout(timeout);
				this.logger.error(`HTTP/2 connection error: ${err.message}`);
				reject(err);
			});

			const requestBody = JSON.stringify({
				document_key: documentKey,
			});

			const req = client.request({
				":method": "POST",
				":path": "/yorkie.v1.AdminService/GetDocument",
				"Content-Type": "application/json",
				"content-length": Buffer.byteLength(requestBody).toString(),
				Authorization: `API-Key ${secretKey}`,
			});

			const timeout = setTimeout(() => {
				this.logger.error(`Yorkie request timed out for ${documentKey}`);
				client.close();
				reject(new Error("Yorkie request timed out"));
			}, TIMEOUT_MS);

			req.write(requestBody);
			req.setEncoding("utf8");

			let data = "";

			req.on("data", (chunk) => {
				data += chunk;
			});

			req.on("end", () => {
				clearTimeout(timeout);
				client.close();

				try {
					const response = JSON.parse(data);

					if (response.error) {
						this.logger.error(
							`Yorkie API error: ${response.error.message || JSON.stringify(response.error)}`
						);
						reject(new Error(response.error.message || "Yorkie API error"));
						return;
					}

					if (!response.document) {
						this.logger.error("No document in Yorkie API response");
						reject(new Error("No document found in Yorkie API response"));
						return;
					}

					this.logger.log(`Successfully fetched Yorkie document: ${documentKey}`);
					resolve(response.document as YorkieDocument);
				} catch (error) {
					this.logger.error(`Failed to parse Yorkie API response: ${error.message}`);
					reject(new Error(`Failed to parse Yorkie API response: ${error.message}`));
				}
			});

			req.on("error", (err) => {
				clearTimeout(timeout);
				this.logger.error(`Request error: ${err.message}`);
				client.close();
				reject(err);
			});

			req.end();
		});
	}

	/**
	 * Get multiple documents from Yorkie Admin API
	 * @param documentKeys - Array of Yorkie document keys
	 * @returns Array of Yorkie documents
	 */
	async getDocuments(documentKeys: string[]): Promise<YorkieDocument[]> {
		this.logger.log(`Fetching ${documentKeys.length} Yorkie documents`);

		return new Promise((resolve, reject) => {
			const TIMEOUT_MS = 30000;
			const apiAddr = this.configService.get<string>("YORKIE_API_ADDR");
			const secretKey = this.configService.get<string>("YORKIE_PROJECT_SECRET_KEY");

			if (!apiAddr || !secretKey) {
				reject(new Error("YORKIE_API_ADDR or YORKIE_PROJECT_SECRET_KEY not configured"));
				return;
			}

			const client = connect(apiAddr);

			const timeout = setTimeout(() => {
				this.logger.error(
					`Yorkie request timed out for documents ${documentKeys.join(", ")}`
				);
				client.close();
				reject(new Error("Yorkie request timed out"));
			}, TIMEOUT_MS);

			client.on("error", (err) => {
				clearTimeout(timeout);
				this.logger.error(`HTTP/2 connection error: ${err.message}`);
				reject(err);
			});

			const requestBody = JSON.stringify({
				document_keys: documentKeys,
				include_root: true,
				include_presences: false,
			});

			const req = client.request({
				":method": "POST",
				":path": "/yorkie.v1.AdminService/GetDocuments",
				"Content-Type": "application/json",
				"content-length": Buffer.byteLength(requestBody).toString(),
				Authorization: `API-Key ${secretKey}`,
			});

			req.write(requestBody);
			req.setEncoding("utf8");

			let data = "";

			req.on("data", (chunk) => {
				data += chunk;
			});

			req.on("end", () => {
				clearTimeout(timeout);
				client.close();

				try {
					const response = JSON.parse(data);

					if (response.error) {
						this.logger.error(
							`Yorkie API error: ${response.error.message || JSON.stringify(response.error)}`
						);
						reject(new Error(response.error.message || "Yorkie API error"));
						return;
					}

					if (!response.documents) {
						this.logger.warn("No documents in Yorkie API response");
						resolve([]);
						return;
					}

					this.logger.log(
						`Successfully fetched ${response.documents.length} Yorkie documents`
					);
					resolve(response.documents as YorkieDocument[]);
				} catch (error) {
					this.logger.error(`Failed to parse Yorkie API response: ${error.message}`);
					reject(new Error(`Failed to parse Yorkie API response: ${error.message}`));
				}
			});

			req.on("error", (err) => {
				clearTimeout(timeout);
				this.logger.error(`Request error: ${err.message}`);
				client.close();
				reject(err);
			});

			req.end();
		});
	}

	/**
	 * Extract text content from Yorkie document root
	 * @param yorkieDoc - Yorkie document
	 * @returns Extracted text content
	 */
	extractContent(yorkieDoc: YorkieDocument): string {
		try {
			if (!yorkieDoc.root) {
				this.logger.warn(`No root field in Yorkie document: ${yorkieDoc.key}`);
				return "";
			}

			// Parse the root JSON string
			const root =
				typeof yorkieDoc.root === "string" ? JSON.parse(yorkieDoc.root) : yorkieDoc.root;

			// Extract content field (assuming it's a CRDT Text structure)
			if (root.content) {
				// If content is an array of operations/nodes, extract text
				if (Array.isArray(root.content)) {
					return root.content.map((node) => node.val).join("");
				}

				// If content is a string
				if (typeof root.content === "string") {
					return root.content;
				}

				// If content is an object with a specific structure
				if (root.content.value) {
					return root.content.value;
				}
			}

			// Fallback: stringify the entire root
			this.logger.warn(
				`Could not extract content from Yorkie document: ${yorkieDoc.key}, using fallback`
			);

			return JSON.stringify(root);
		} catch (error) {
			this.logger.error(`Error extracting content from Yorkie document: ${error.message}`);
			return "";
		}
	}
}
