import { useParams } from "react-router-dom";
import "./ExtraInfo.css";
import ComingSoon from "../../../../shared/comingSoon/ComingSoon";
import BrammamRules from "../rules/BrammamRules";
import { Container } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
const ExtraInfo = () => {
  const { event } = useParams();
  const validEvents = ["meerigai", "olisuvadu", "solalvalar", "eluthoviyam"];

  const [eventDetails, setEventDetails] = useState([]);
  useEffect(() => {
    if (validEvents.includes(event)) {
      axios
        .get(`/api/brammams/${event}`)
        .then((res) => {
          setEventDetails(res.data[0]);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);
  if (validEvents.includes(event)) {
    return (
      <div
        className="pongal-landing-container-div"
        style={{ height: "fit-content" }}
      >
        <Container>
          <BrammamRules eventData={eventDetails} />
        </Container>
      </div>
    );
  } else {
    return <ComingSoon />;
  }
};

export default ExtraInfo;
