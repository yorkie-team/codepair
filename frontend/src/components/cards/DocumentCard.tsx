import moment from "moment";
import { Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Document } from "../../hooks/api/types/document.d";
import { useNavigate, useParams } from "react-router-dom";

interface DocumentCardProps {
	document: Document;
}

function DocumentCard(props: DocumentCardProps) {
	const { document } = props;
	const navigate = useNavigate();
	const params = useParams();

	const handleToDocument = () => {
		navigate(`/${params.workspaceSlug}/${document.id}`);
	};

	return (
		<Card sx={{ width: "100%" }}>
			<CardActionArea onClick={handleToDocument}>
				<CardContent>
					<Typography variant="h5" component="div" noWrap>
						{document.title}
					</Typography>
					<Stack direction="row" alignItems="center" gap={1}>
						<AccessTimeIcon
							fontSize="small"
							sx={{
								color: "text.secondary",
							}}
						/>
						<Typography variant="body2" color="text.secondary" noWrap>
							Changed {moment(document.updatedAt).fromNow()}
						</Typography>
					</Stack>
				</CardContent>
			</CardActionArea>
		</Card>
	);
}

export default DocumentCard;
