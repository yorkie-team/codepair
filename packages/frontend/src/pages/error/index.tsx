import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
	const navigate = useNavigate();

	const handleGoHome = () => {
		navigate("/");
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
				width: "100vw",
				textAlign: "center",
				bgcolor: "background.default",
				color: "text.primary",
				p: 3,
			}}
		>
			<Typography variant="h1" component="h1" gutterBottom>
				404
			</Typography>
			<Typography variant="h5" component="p" gutterBottom>
				Page Not Found
			</Typography>
			<Typography variant="body1" component="p" gutterBottom>
				The page you are looking for does not exist.
			</Typography>
			<Button variant="contained" color="primary" onClick={handleGoHome} sx={{ mt: 2 }}>
				Go to Home
			</Button>
		</Box>
	);
};

export default NotFound;
