import {
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Box,
	TableContainer,
	Typography,
	IconButton,
	AvatarGroup,
	useMediaQuery,
	useTheme,
	Avatar,
} from "@mui/material";
import { Document } from "../../hooks/api/types/document.d";
import moment from "moment";
import { useParams, Link } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function TableContent({ documents }: { documents: Document[] }) {
	const params = useParams();
	const theme = useTheme();
	const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
	const parsePresenceData = (data: {
		color: string;
		name: string;
		cursor: string | null;
		selection: string | null;
	}) => {
		return {
			color: data.color.replace(/^"|"$/g, ""),
			name: data.name.replace(/^"|"$/g, ""),
			cursor: data.cursor,
			selection: data.selection,
		};
	};
	let presenceList = [];

	return (
		<TableContainer component={Box}>
			<Table stickyHeader>
				<TableHead>
					<TableRow>
						<TableCell sx={{ width: "18%" }}>Title</TableCell>
						<TableCell sx={{ width: "18%" }}>Tag</TableCell>
						<TableCell sx={{ width: "18%" }}>User</TableCell>
						<TableCell sx={{ width: "18%" }}>Date</TableCell>
						<TableCell sx={{ width: "18%" }}>Last Edit</TableCell>
						<TableCell sx={{ width: "10%" }}></TableCell>
					</TableRow>
				</TableHead>
				<TableBody
					style={{
						maxHeight: "100%",
						overflow: "auto",
					}}
				>
					{documents.map((doc) => {
						presenceList = Object.values(doc.presences || {}).map((presence) =>
							parsePresenceData(presence.data)
						);
						return (
							<TableRow key={doc.id}>
								<TableCell sx={{ maxWidth: isSmallScreen ? 132 : 264 }}>
									<Link
										to={`/${params.workspaceSlug}/${doc.id}`}
										style={{
											textDecoration: "none",
											color: "primary",
										}}
									>
										<Typography variant="body2" color="text.primary" noWrap>
											{doc.title}
										</Typography>
									</Link>
								</TableCell>
								<TableCell>-</TableCell>
								<TableCell>
									<AvatarGroup
										max={isSmallScreen ? 2 : 4}
										sx={{
											"& .MuiAvatar-root": {
												width: 24,
												height: 24,
											},
										}}
									>
										{presenceList.map((presence, index) => (
											<Avatar
												key={index}
												sx={{ bgcolor: presence.color }}
												alt={presence.name}
											>
												{presence.name[0]}
											</Avatar>
										))}
									</AvatarGroup>
								</TableCell>
								<TableCell sx={{ color: "primary.main" }}>
									{moment(doc.createdAt).format("D MMM YYYY")}
								</TableCell>
								<TableCell sx={{ color: "text.secondary" }}>
									{moment(doc.updatedAt).fromNow()}
								</TableCell>
								<TableCell sx={{ py: 0 }} align="right">
									<IconButton color="inherit" onClick={() => {}}>
										<MoreVertIcon fontSize="small" />
									</IconButton>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
