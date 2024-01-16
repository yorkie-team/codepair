import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectSupabase } from "../store/supabaseSlice";
import { Session } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Box } from "@mui/material";

function Index() {
	const supabaseStore = useSelector(selectSupabase);
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		if (!supabaseStore.client) return;

		supabaseStore.client.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		const {
			data: { subscription },
		} = supabaseStore.client.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, [supabaseStore.client]);

	if (!session && supabaseStore.client) {
		return (
			<Box p={4}>
				<Auth supabaseClient={supabaseStore.client} appearance={{ theme: ThemeSupa }} />
			</Box>
		);
	} else {
		return <div>Logged in!</div>;
	}
}

export default Index;
