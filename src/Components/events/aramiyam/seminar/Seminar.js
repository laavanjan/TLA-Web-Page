import React, { useState, useEffect } from "react";
import Heading from "../../../../shared/Heading";
import { Container, Grid } from "@mui/material";
import SeminarCard from "./seminarCard/SeminarCard";
import "./seminar.css";

function Seminar() {
  const [seminarData, setSeminarData] = useState([]);

  useEffect(() => {
    const fetchSeminarData = async () => {
      try {
        const response = await fetch('/api/aramiyams');

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setSeminarData(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchSeminarData();
  }, []);

  return (
    <div className="seminar-container">
      <Container sx={{ pb: 4 }}>
        <Heading className="heading">கருத்தரங்குகள்</Heading>
        <Grid
          className="card-container"
          container
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center "}
          flexShrink={1}
          spacing={4}
        >
          {seminarData.map((seminarData) => {
            return (
              <SeminarCard key={seminarData.id} SeminarData={seminarData} />
            );
          })}
        </Grid>
      </Container>
    </div>
  );
}

export default Seminar;
