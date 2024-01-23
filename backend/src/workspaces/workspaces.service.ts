import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { Prisma, Workspace } from "@prisma/client";
import { PrismaService } from "src/db/prisma.service";
import { FindWorkspacesResponse } from "./types/find-workspaces-response.type";
import { CreateInvitationTokenResponse } from "./types/create-inviation-token-response.type";
import { WorkspaceRoleConstants } from "src/utils/constants/auth-role";
import slugify from "slugify";
import { generateRandomKey } from "src/utils/functions/random-string";
import * as moment from "moment";

@Injectable()
export class WorkspacesService {
	constructor(private prismaService: PrismaService) {}

	async create(userId: string, title: string): Promise<Workspace> {
		let slug = slugify(title);

		const duplicatedWorkspaceList = await this.prismaService.workspace.findMany({
			where: {
				slug: {
					startsWith: slug,
				},
			},
		});

		if (duplicatedWorkspaceList.length) {
			slug += `-${duplicatedWorkspaceList.length + 1}`;
		}

		const workspace = await this.prismaService.workspace.create({
			data: {
				title,
				slug,
			},
		});

		await this.prismaService.userWorkspace.create({
			data: {
				workspaceId: workspace.id,
				userId,
				role: WorkspaceRoleConstants.OWNER,
			},
		});

		return workspace;
	}

	async findOneBySlug(userId: string, workspaceSlug: string) {
		try {
			const foundWorkspace = await this.prismaService.workspace.findFirstOrThrow({
				where: {
					slug: workspaceSlug,
				},
			});

			await this.prismaService.userWorkspace.findFirstOrThrow({
				where: {
					userId,
					workspaceId: foundWorkspace.id,
				},
			});

			return foundWorkspace;
		} catch (e) {
			throw new NotFoundException();
		}
	}

	async findMany(
		userId: string,
		pageSize: number,
		cursor?: string
	): Promise<FindWorkspacesResponse> {
		const additionalOptions: Prisma.WorkspaceFindManyArgs = {};

		if (cursor) {
			additionalOptions.cursor = { id: cursor };
		}

		const workspaceList = await this.prismaService.workspace.findMany({
			take: pageSize + 1,
			where: {
				userWorkspaceList: {
					some: {
						userId: {
							equals: userId,
						},
					},
				},
			},
			orderBy: {
				id: "desc",
			},
			...additionalOptions,
		});

		return {
			workspaces: workspaceList.slice(0, pageSize),
			cursor: workspaceList.length > pageSize ? workspaceList[pageSize].id : null,
		};
	}

	async createInvitationToken(
		userId: string,
		workspaceId: string,
		expiredAt: Date
	): Promise<CreateInvitationTokenResponse> {
		try {
			await this.prismaService.userWorkspace.findFirstOrThrow({
				where: {
					userId,
					workspaceId,
				},
			});
		} catch (e) {
			throw new NotFoundException();
		}

		const token = generateRandomKey();

		await this.prismaService.workspaceInvitationToken.create({
			data: {
				workspaceId,
				token,
				expiredAt,
			},
		});

		return {
			invitationToken: token,
		};
	}

	async join(userId: string, invitationToken: string) {
		let workspaceId: string;

		try {
			const workspaceInvitationToken =
				await this.prismaService.workspaceInvitationToken.findFirst({
					where: {
						token: invitationToken,
					},
				});

			workspaceId = workspaceInvitationToken.workspaceId;

			if (
				workspaceInvitationToken.expiredAt &&
				moment().isAfter(workspaceInvitationToken.expiredAt)
			) {
				throw new Error();
			}
		} catch (err) {
			throw new UnauthorizedException("Invitation token is invalid or expired.");
		}

		try {
			await this.prismaService.workspace.findUniqueOrThrow({
				where: {
					id: workspaceId,
				},
			});
		} catch (e) {
			throw new NotFoundException("The workspace is deleted.");
		}

		const userWorkspace = await this.prismaService.userWorkspace.findFirst({
			where: {
				userId,
				workspaceId,
			},
			include: {
				workspace: true,
			},
		});

		if (userWorkspace) {
			return userWorkspace.workspace;
		}

		const newUserWorkspace = await this.prismaService.userWorkspace.create({
			data: {
				userId,
				workspaceId,
				role: WorkspaceRoleConstants.MEMBER,
			},
			include: {
				workspace: true,
			},
		});

		return newUserWorkspace.workspace;
	}
}
