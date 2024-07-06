import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetSettingsResponse } from "./types/settings";
import { useDispatch, useSelector } from "react-redux";
import { selectSetting, setFileUpload, setYorkieIntelligence } from "../../store/settingSlice";
import { useEffect } from "react";

export const generateGetSettingsQueryKey = () => {
	return ["settings"];
};

export const useGetSettingsQuery = () => {
	const dispatch = useDispatch();
	const settingStore = useSelector(selectSetting);
	const query = useQuery({
		queryKey: generateGetSettingsQueryKey(),
		enabled: settingStore.yorkieIntelligence === null && settingStore.fileUpload === null,
		queryFn: async () => {
			const res = await axios.get<GetSettingsResponse>("/settings");
			return res.data;
		},
		staleTime: 1000 * 60 * 60 * 24, // 24 hours
	});

	useEffect(() => {
		if (!query.isSuccess) return;

		const data = query.data;
		dispatch(setYorkieIntelligence(data.yorkieIntelligence));
		dispatch(setFileUpload(data.fileUpload));
	}, [dispatch, query.data, query.isSuccess]);

	return query;
};
