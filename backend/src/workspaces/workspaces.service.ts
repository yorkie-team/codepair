import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { Workspace } from "@prisma/client";
import * as moment from "moment";
import { CheckService } from "src/check/check.service";
import { PrismaService } from "src/db/prisma.service";
import { WorkspaceRoleConstants } from "src/utils/constants/auth-role";
import { generateRandomKey } from "src/utils/functions/random-string";
import { CreateInvitationTokenResponse } from "./types/create-inviation-token-response.type";
import { FindWorkspacesResponse } from "./types/find-workspaces-response.type";
import { UpdateWorkspaceTitleResponse } from "./types/update-workspace-title-response.type";

@Injectable()
export class WorkspacesService {
	constructor(
		private prismaService: PrismaService,
		private checkService: CheckService
	) {}

	async create(userId: string, title: string): Promise<Workspace> {
		const { conflict } = await this.checkService.checkNameConflict(title);

		if (conflict) {
			throw new ConflictException("Workspace title is already in use.");
		}

		const currentWorkspaceCount = await this.prismaService.userWorkspace.count({
			where: { userId },
		});

		const workspace = await this.prismaService.workspace.create({
			data: {
				title,
				slug: encodeURI(title),
			},
		});

		await this.prismaService.userWorkspace.create({
			data: {
				workspaceId: workspace.id,
				userId,
				role: WorkspaceRoleConstants.OWNER,
				order: currentWorkspaceCount,
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
		} catch {
			throw new NotFoundException(
				"Workspace not found, or the user lacks the appropriate permissions."
			);
		}
	}

	async findMany(userId: string): Promise<FindWorkspacesResponse> {
		const userWorkspaces = await this.prismaService.userWorkspace.findMany({
			where: {
				userId: {
					equals: userId,
				},
			},
			include: {
				workspace: true,
			},
			orderBy: [
				{
					order: "asc",
				},
				{
					id: "asc",
				},
			],
		});

		return userWorkspaces.map((uw) => uw.workspace);
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
		} catch {
			throw new NotFoundException(
				"Worksapce does not exist, or the user lacks the appropriate permissions."
			);
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
		} catch {
			throw new UnauthorizedException("Invitation token is invalid or expired.");
		}

		try {
			await this.prismaService.workspace.findUniqueOrThrow({
				where: {
					id: workspaceId,
				},
			});
		} catch {
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

		const currentWorkspaceCount = await this.prismaService.userWorkspace.count({
			where: { userId },
		});

		const newUserWorkspace = await this.prismaService.userWorkspace.create({
			data: {
				userId,
				workspaceId,
				role: WorkspaceRoleConstants.MEMBER,
				order: currentWorkspaceCount,
			},
			include: {
				workspace: true,
			},
		});

		return newUserWorkspace.workspace;
	}

	async updateWorkspaceOrder(userId: string, workspaceIds: string[]): Promise<void> {
		const userWorkspaces = await this.prismaService.userWorkspace.findMany({
			where: {
				userId,
				workspaceId: {
					in: workspaceIds,
				},
			},
		});

		const userWorkspaceMap = new Map(userWorkspaces.map((uw) => [uw.workspaceId, uw.id]));
		const missingWorkspaceIds = workspaceIds.filter((id) => !userWorkspaceMap.has(id));

		if (missingWorkspaceIds.length > 0) {
			throw new NotFoundException(
				"Some workspaces not found, or the user lacks the appropriate permissions."
			);
		}

		const now = new Date();
		await this.prismaService.$transaction(
			workspaceIds.map((workspaceId, index) => {
				const userWorkspaceId = userWorkspaceMap.get(workspaceId);
				return this.prismaService.userWorkspace.update({
					where: {
						id: userWorkspaceId,
					},
					data: {
						order: index,
						updatedAt: now,
					},
				});
			})
		);
	}

	async updateTitle(
		userId: string,
		workspaceId: string,
		newTitle: string
	): Promise<UpdateWorkspaceTitleResponse> {
		try {
			await this.prismaService.userWorkspace.findFirstOrThrow({
				where: {
					userId,
					workspaceId,
				},
			});
		} catch {
			throw new NotFoundException(
				"Workspace not found, or the user lacks the appropriate permissions."
			);
		}

		const { conflict } = await this.checkService.checkNameConflict(newTitle);

		if (conflict) {
			throw new ConflictException("Workspace title is already in use.");
		}

		const updatedWorkspace = await this.prismaService.workspace.update({
			where: {
				id: workspaceId,
			},
			data: {
				title: newTitle,
				slug: encodeURI(newTitle),
			},
		});

		return updatedWorkspace;
	}
}
