import { Container, Grid } from "@mui/material";
import Heading from "../../shared/Heading";

const ComingSoon = () => {
    return (
        <Container maxWidth='xl' className="intro-container">
            <Heading>
                விரைவில்</Heading>
            <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
            >
                <Grid item sm='1' >

                </Grid>
                <Grid item sm='12'>
                    <div style={{ height: '3vh' }}></div>
                    <Container maxWidth="md">
                        <div className="intro-heading1">இந்தப் பக்கம் இன்னும் உருவாக்கப்படவில்லை.</div>

                    </Container>
                </Grid>


            </Grid>
        </Container>
    );
}

export default ComingSoon;