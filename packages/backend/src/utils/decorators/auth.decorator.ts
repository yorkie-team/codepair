import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_PATH = "isPublicPath";
export const Public = () => SetMetadata(IS_PUBLIC_PATH, true);
