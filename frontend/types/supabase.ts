export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
	public: {
		Tables: {
			Document: {
				Row: {
					content: string | null;
					createdAt: string;
					id: string;
					title: string | null;
					updatedAt: string | null;
					workspaceId: string;
					yorkieDocumentId: string | null;
				};
				Insert: {
					content?: string | null;
					createdAt?: string;
					id?: string;
					title?: string | null;
					updatedAt?: string | null;
					workspaceId: string;
					yorkieDocumentId?: string | null;
				};
				Update: {
					content?: string | null;
					createdAt?: string;
					id?: string;
					title?: string | null;
					updatedAt?: string | null;
					workspaceId?: string;
					yorkieDocumentId?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "Document_workspaceId_fkey";
						columns: ["workspaceId"];
						isOneToOne: false;
						referencedRelation: "Workspace";
						referencedColumns: ["id"];
					},
				];
			};
			User: {
				Row: {
					createdAt: string;
					id: string;
					nickname: string | null;
					updatedAt: string | null;
				};
				Insert: {
					createdAt?: string;
					id?: string;
					nickname?: string | null;
					updatedAt?: string | null;
				};
				Update: {
					createdAt?: string;
					id?: string;
					nickname?: string | null;
					updatedAt?: string | null;
				};
				Relationships: [];
			};
			UserWorkspace: {
				Row: {
					createdAt: string;
					id: string;
					updatedAt: string | null;
					userId: string;
					workspaceId: string;
				};
				Insert: {
					createdAt?: string;
					id?: string;
					updatedAt?: string | null;
					userId: string;
					workspaceId: string;
				};
				Update: {
					createdAt?: string;
					id?: string;
					updatedAt?: string | null;
					userId?: string;
					workspaceId?: string;
				};
				Relationships: [
					{
						foreignKeyName: "UserWorkspace_userId_fkey";
						columns: ["userId"];
						isOneToOne: false;
						referencedRelation: "User";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "UserWorkspace_workspaceId_fkey";
						columns: ["workspaceId"];
						isOneToOne: false;
						referencedRelation: "Workspace";
						referencedColumns: ["id"];
					},
				];
			};
			Workspace: {
				Row: {
					createdAt: string;
					id: string;
					title: string | null;
					updatedAt: string | null;
				};
				Insert: {
					createdAt?: string;
					id?: string;
					title?: string | null;
					updatedAt?: string | null;
				};
				Update: {
					createdAt?: string;
					id?: string;
					title?: string | null;
					updatedAt?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
}

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (Database["public"]["Tables"] & Database["public"]["Views"])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
				Database[PublicTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
			Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
				Database["public"]["Views"])
		? (Database["public"]["Tables"] &
				Database["public"]["Views"])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof Database["public"]["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
		? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof Database["public"]["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
		? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
		? Database["public"]["Enums"][PublicEnumNameOrOptions]
		: never;
