CREATE TABLE "User" (
	"id" UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
	"nickname" VARCHAR(255) NULL,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NULL
);

CREATE TABLE "Workspace" (
	"id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	"title" VARCHAR(255) NULL,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NULL
);

CREATE TABLE "UserWorkspace" (
	"id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	"userId" UUID NOT NULL REFERENCES "User" ("id") ON DELETE CASCADE,
	"workspaceId" UUID NOT NULL REFERENCES "Workspace" ("id") ON DELETE CASCADE,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NULL
);

CREATE TABLE "Document" (
	"id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
	"workspaceId" UUID NOT NULL REFERENCES "Workspace" ("id") ON DELETE CASCADE,
	"yorkieDocumentId" VARCHAR(255) NULL,
	"title" VARCHAR(255) NULL,
	"content" VARCHAR(255) NULL,
	"createdAt" timestamp NOT NULL DEFAULT now(),
	"updatedAt" timestamp NULL
);

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON "User" for SELECT
  using ( true );

CREATE POLICY "Users can insert their own profile."
  ON "User" for INSERT
  with check ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON "User" for UPDATE
  using ( auth.uid() = id );
