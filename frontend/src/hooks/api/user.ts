import { useDispatch, useSelector } from "react-redux";
import { selectAuth, setAccessToken } from "../../store/authSlice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { GetUserResponse, UpdateUserRequest } from "./types/user";
import { useEffect } from "react";
import { User, setUserData } from "../../store/userSlice";

export const generateGetUserQueryKey = (accessToken: string) => {
	return ["users", accessToken];
};

export const useGetUserQuery = () => {
	const dispatch = useDispatch();
	const authStore = useSelector(selectAuth);

	if (authStore.accessToken) {
		axios.defaults.headers.common["Authorization"] = `Bearer ${authStore.accessToken}`;
	}

	const query = useQuery({
		queryKey: generateGetUserQueryKey(authStore.accessToken || ""),
		enabled: Boolean(authStore.accessToken),
		queryFn: async () => {
			const res = await axios.get<GetUserResponse>("/users");
			return res.data;
		},
	});

	useEffect(() => {
		if (query.isSuccess) {
			dispatch(setUserData(query.data as User));
		} else if (query.isError) {
			dispatch(setAccessToken(null));
			dispatch(setUserData(null));
			axios.defaults.headers.common["Authorization"] = "";
		}
	}, [dispatch, query.data, query.isError, query.isSuccess]);

	return query;
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
