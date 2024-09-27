import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuth, setAccessToken } from "../../store/authSlice";
import { User, setUserData } from "../../store/userSlice";
import { GetUserResponse, UpdateUserRequest } from "./types/user";

export const generateGetUserQueryKey = (accessToken: string) => {
	return ["users", accessToken];
};

export const useGetUserQuery = () => {
	const dispatch = useDispatch();
	const authStore = useSelector(selectAuth);
	const [axiosInterceptorAdded, setAxiosInterceptorAdded] = useState(false);

	useEffect(() => {
		const interceptor = axios.interceptors.response.use(
			(response) => response,
			async (error) => {
				if (error.response?.status === 401 && !error.config._retry) {
					if (error.config.url === "/auth/refresh") {
						dispatch(logout());
						dispatch(setUserData(null));
						return Promise.reject(error);
					} else {
						error.config._retry = true;
						const { refreshToken } = authStore;
						const response = await axios.post("/auth/refresh", { refreshToken });
						const newAccessToken = response.data.newAccessToken;
						dispatch(setAccessToken(newAccessToken));
						axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
						error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
						return axios(error.config);
					}
				}
				return Promise.reject(error);
			}
		);

		setAxiosInterceptorAdded(true);

		return () => {
			setAxiosInterceptorAdded(false);
			axios.interceptors.response.eject(interceptor);
		};
	}, [authStore, dispatch]);

	const query = useQuery({
		queryKey: generateGetUserQueryKey(authStore.accessToken || ""),
		enabled: Boolean(axiosInterceptorAdded && authStore.accessToken),
		queryFn: async () => {
			axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.accessToken}`;
			const res = await axios.get<GetUserResponse>("/users");
			return res.data;
		},
	});

	useEffect(() => {
		if (query.isSuccess) {
			dispatch(setUserData(query.data as User));
		} else if (query.isError) {
			dispatch(logout());
			dispatch(setUserData(null));
			axios.defaults.headers.common["Authorization"] = "";
		}
	}, [dispatch, query.data, query.isError, query.isSuccess]);

	return { ...query, isLoading: query.isLoading || !axiosInterceptorAdded };
};

export const useUpdateUserNicknameMutation = () => {
	const authStore = useSelector(selectAuth);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateUserRequest) => {
			const res = await axios.put<void>("/users", data);

			return res.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: generateGetUserQueryKey(authStore.accessToken || ""),
			});
		},
	});
};
