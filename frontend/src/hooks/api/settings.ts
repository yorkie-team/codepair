import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	selectFeatureSetting,
	setFileUpload,
	setYorkieIntelligence,
} from "../../features/settings";
import { GetSettingsResponse } from "./types/settings";

export const generateGetSettingsQueryKey = () => {
	return ["settings"];
};

export const useGetSettingsQuery = () => {
	const dispatch = useDispatch();
	const featureSettingStore = useSelector(selectFeatureSetting);
	const query = useQuery({
		queryKey: generateGetSettingsQueryKey(),
		enabled:
			featureSettingStore.yorkieIntelligence === null &&
			featureSettingStore.fileUpload === null,
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
