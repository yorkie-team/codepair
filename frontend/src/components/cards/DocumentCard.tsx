import { Paper, Stack, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { Document } from "../../hooks/api/types/document.d";
import moment from "moment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface DocumentCardProps {
	document: Document;
}

function DocumentCard(props: DocumentCardProps) {
	const { document } = props;
	const params = useParams();

	return (
		<Link
			to={`/${params.workspaceSlug}/${document.id}`}
			style={{
				textDecoration: "none",
			}}
		>
			<Paper
				variant="outlined"
				sx={{
					px: 3,
					py: 2,
				}}
			>
				<Stack direction="row" justifyContent="space-between">
					<Typography variant="body2" color="primary">
						{moment(document.createdAt).format("D MMM YYYY")}
					</Typography>

					{/* TODO(devleejb): When the document deletion is implemented, uncomment the following code */}
					{/* <IconButton size="small" sx={{ p: 0 }}>
						<MoreVertIcon fontSize="small" />
					</IconButton> */}
				</Stack>
				<Typography variant="h6" component="div" noWrap fontWeight={600}>
					{document.title}
				</Typography>
				<Stack direction="row" mt={1} gap={1} flexWrap="wrap" height={56}>
					{/* TODO(devleejb): When the tag sytem is implemented, uncomment the following code */}
					{/* {new Array(4).fill(0).map((_, index) => (
						<Chip
							label={`Tag ${index + 1}`}
							sx={{ borderRadius: "4px", backgroundColor: "#E6F2FC" }}
							size="small"
						/>
					))} */}
				</Stack>
				<Stack direction="row" alignItems="end" justifyContent="space-between" mt={2}>
					<Stack direction="row" alignItems="center" gap={1}>
						<AccessTimeIcon
							fontSize="small"
							sx={{
								color: "text.secondary",
							}}
						/>
						<Typography variant="body2" color="text.secondary" noWrap>
							{moment(document.updatedAt).fromNow()}
						</Typography>
					</Stack>
					{/* TODO(devleejb): When the fetching presemces from yorkie is implemented, uncomment the following code */}
					{/* <AvatarGroup
						total={6}
						max={5}
						sx={{
							"& .MuiAvatar-root": {
								width: 32,
								height: 32,
							},
						}}
					>
						<Avatar sx={{ width: 32, height: 32 }} alt="Remy Sharp" />
						<Avatar sx={{ width: 32, height: 32 }} alt="Remy Sharp" />
						<Avatar sx={{ width: 32, height: 32 }} alt="Remy Sharp" />
						<Avatar sx={{ width: 32, height: 32 }} alt="Remy Sharp" />
						<Avatar sx={{ width: 32, height: 32 }} alt="Remy Sharp" />
						<Avatar sx={{ width: 32, height: 32 }} alt="Remy Sharp" />
						<Avatar sx={{ width: 32, height: 32 }} alt="Remy Sharp" />
						<Avatar sx={{ width: 32, height: 32 }} alt="Remy Sharp" />
						<Avatar sx={{ width: 32, height: 32 }} alt="Remy Sharp" />
					</AvatarGroup> */}
				</Stack>
			</Paper>
		</Link>
	);
}

export default DocumentCard;
