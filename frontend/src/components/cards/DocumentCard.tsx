import moment from "moment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Document } from "../../hooks/api/types/document.d";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Flex, Text } from "yorkie-ui";

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
		<Card.Root width="full" cursor="pointer" onClick={handleToDocument}>
			<Card.Header>
				<Card.Title
					style={{
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{document.title}
				</Card.Title>
				<Card.Description
					style={{
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					<Flex align="center" gap={2}>
						<AccessTimeIcon
							fontSize="small"
							sx={{
								color: "text.secondary",
							}}
						/>
						{moment(document.updatedAt).fromNow()}
					</Flex>
				</Card.Description>
			</Card.Header>
		</Card.Root>
	);
}

export default DocumentCard;
