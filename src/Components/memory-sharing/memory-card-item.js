import { Card } from "@mui/material";
import "./memory-card-item.css";

export default function MemoryCardItem({ data }) {
	return <Card className="memory-card-item">
		<div className="shared-by">
			<img src={data.sharedBy.profileImageUrl} />
			<span className="shared-by-name">{data.sharedBy.name}</span>
			<span className="shared-by-email">{data.sharedBy.email}</span>
		</div>
		<h3>{data.heading}</h3>
		<p>{data.content}</p>

		<div className="image-container">
			{data.images.map(image => {
				return <img src={image} key={image} />
			})}
		</div>

	</Card>

}