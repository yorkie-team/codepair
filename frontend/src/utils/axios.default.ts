import { AxiosError } from "axios";

export const isAxios404Error = (error: unknown): boolean => {
	return error instanceof AxiosError && error.response?.status === 404;
};

export const isAxios500Error = (error: unknown): boolean => {
	return error instanceof AxiosError && error.response?.status === 500;
};
