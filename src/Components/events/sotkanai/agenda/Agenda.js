import React from "react";
import { Grid, Container } from "@mui/material";
import "./agenda.css";

function Agenda() {

    return (
        <div className="agenda-container-div">
            <Container
                maxWidth="lg"
                className="agenda-container"
                sx={{ pb: 4 }}
            >
                <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={0.001}
                    cols={2}
                >
                  <a data-flickr-embed="true" href="https://www.flickr.com/photos/197344750@N07/53570767991/in/dateposted-public/" title="430716720_701302175548611_7313529510511530310_n"><img src="https://live.staticflickr.com/65535/53570767991_4cabca69b6_b.jpg" width="819" height="1024" alt="430716720_701302175548611_7313529510511530310_n"/></a><script async src="//embedr.flickr.com/assets/client-code.js" charset="utf-8"></script> </Grid>
            </Container>
        </div>
    );
}

export default Agenda;
