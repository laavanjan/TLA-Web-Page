import React from "react";
import "./BrammamRules.css";
import { Grid, Container } from "@mui/material";
import Heading from "../../../../shared/Heading";
const BrammamRules = ({ eventData }) => {
  return (
    <React.Fragment>
      <div>
        <Heading>{eventData?.nameTamil} - போட்டி விதிமுறைகள்</Heading>

        <Grid item sm="12">
          <Container maxWidth="md">
            <div className="rules-decription">
              <ol type="1">
                {eventData?.rules?.map((rule, index) => {
                  return <li key={index}>{rule}</li>;
                })}
              </ol>
            </div>
          </Container>
        </Grid>
      </div>
    </React.Fragment>
  );
};

export default BrammamRules;
