import { Grid2 as Grid } from "@mui/material";
import DocumentCard from "../../components/cards/DocumentCard";
import { Document } from "../../hooks/api/types/document.d";

function BoardTab({ documents }: { documents: Document[] }) {
	return (
		<Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
			{documents.map((doc) => (
				<Grid key={doc.id} size={4}>
					<DocumentCard document={doc} />
				</Grid>
			))}
		</Grid>
	);
}

export default BoardTab;
