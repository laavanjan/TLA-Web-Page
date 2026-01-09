import {
	Grid, Container
} from '@mui/material';
import "./intro.css";

export default function MemorySharingIntro() {
	return (
		<>
			<div className="memory-sharing-landing-container">
				<Container>
					<h1>
						நினைவுகள் மீட்டல்
					</h1>
					<Grid
						container
						direction="column"
						justifyContent="center"
						alignItems="center"
					>
						<Grid item>
							<Container maxWidth="md">
								<p>
									தமிழ் இலக்கிய மன்றத்துடனான நினைவுகளை நண்பர்களுடன் பகிர்ந்து கொள்ளுங்கள்
								</p>
							</Container>
						</Grid>
					</Grid>
				</Container>
			</div>
		</>
	);
}