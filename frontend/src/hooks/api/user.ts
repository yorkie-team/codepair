import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectAuth } from "../../store/authSlice";
import { User, setUserData } from "../../store/userSlice";
import { GetUserResponse, UpdateUserRequest } from "./types/user";

export const generateGetUserQueryKey = (accessToken: string) => {
	return ["users", accessToken];
};

export const useGetUserQuery = () => {
	const dispatch = useDispatch();
	const authStore = useSelector(selectAuth);

	const query = useQuery({
		queryKey: generateGetUserQueryKey(authStore.accessToken || ""),
		enabled: Boolean(authStore.accessToken),
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
