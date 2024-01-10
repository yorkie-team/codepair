import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./App.css";
import { Button } from "@mui/material";

function App() {
	return (
		<>
			<Button variant="text">Text</Button>
			<Button variant="contained">Contained</Button>
			<Button variant="outlined">Outlined</Button>
		</>
	);
}

export default App;
