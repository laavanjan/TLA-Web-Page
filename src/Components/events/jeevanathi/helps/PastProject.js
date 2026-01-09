import "./pastproject.css"; 
import React from "react";
import { Card, CardContent, CardMedia, Typography, Grid } from "@mui/material";
import SchoolA from "../../../../images/Events/jeevanathi/semmalai-2024/img1.jpg";
import School1 from "../../../../images/Events/jeevanathi/udaweriya-2018/school1.jpg";
import School2 from "../../../../images/Events/jeevanathi/udaweriya-2018/school2.jpg";
import School3 from "../../../../images/Events/jeevanathi/udaweriya-2018/school3.jpg";
import School4 from "../../../../images/Events/jeevanathi/udaweriya-2018/school4.jpg";
import Flood1 from "../../../../images/Events/jeevanathi/flood-2018/flood1.jpg";
import Flood2 from "../../../../images/Events/jeevanathi/flood-2018/flood2.jpg";
import Flood3 from "../../../../images/Events/jeevanathi/flood-2018/flood3.jpg";
import Flood4 from "../../../../images/Events/jeevanathi/flood-2018/flood4.jpg";
import Landslide1 from "../../../../images/Events/jeevanathi/landslide-badulla-2014/landslide1.jpg";
import Landslide2 from "../../../../images/Events/jeevanathi/landslide-badulla-2014/landslide2.jpg";
import Landslide3 from "../../../../images/Events/jeevanathi/landslide-badulla-2014/landslide3.jpg";
import Landslide4 from "../../../../images/Events/jeevanathi/landslide-badulla-2014/landslide4.jpg";



const pastEvents = [
  {
    projectName: "செம்மலை மகா வித்தியாலய திட்டம் - 2024",
    photos: [SchoolA],
    description:
      "மொறட்டுவை பல்கலைக்கழக தமிழ் இலக்கிய மன்றத்தின் ஜீவநதி செயற்றிட்டத்தின் மூலம் முல்லைத்தீவு செம்மலை மகா வித்தியாலயத்தின் மாணவர்களுக்கு ஐந்து துவிச்சக்கரவண்டிகள் இலங்கை தமிழர் சமூகம் கத்தாரின் உதவியுடன் கையளிக்கப்பட்டது.",
  },
  {
    projectName: "உடவேரிய பாடசாலை திட்டம் - 2018",
    photos: [School1, School2, School3, School4],
    description:
      "ஜீவநதி திட்டத்தின் மூலம் பதுளை மாவட்டத்தில் அமைந்திருக்கும் உடவெறியா கிராமத்தின் பாடசாலை மாணவர்களுக்காக அப்பியாசக் கொப்பிகள், புத்தகப்பை, சப்பாத்து, காலணி உறை போன்றவையும் மற்றும் உடவெறியா பாடசாலை அபிவிருத்திக்குச் சிறிய நிதியுதவியும் வழங்கி வைக்கப்பட்டது.",
  },
  {
    projectName: "வெள்ள நிவாரணத் திட்டம் - 2018",
    photos: [Flood1, Flood2, Flood3, Flood4],
    description:
      "நாட்டின் பல்வேறு மாவட்ட மக்களிடமிருந்து நிவாரண பொருட்கள் எமது மன்றத்தினால் சேகரிக்கப்பட்டு கிளிநொச்சி மற்றும் முல்லைத்தீவில் வெள்ளத்தினால் பாதிக்கப்பட்ட மக்களுக்கு வழங்கப்பட்டது.",
  },

  {
    projectName: "மண்சரிவு நிவாரண திட்டம் - 2014",
    photos: [Landslide1,Landslide2,Landslide3,Landslide4],
    description: "பதுளை மாவட்டத்தில் மண்சரிவினால் பாதிக்கப்பட்ட மக்களுக்கு நிவாரண உதவிகள் எமது தமிழிலக்கிய மன்றத்தினால் வழங்கி வைக்கப்பட்டது.",
  },
];

function PastProject() {
  const maxVisiblePhotos = 4;

  const [visiblePhotos, setVisiblePhotos] = React.useState(maxVisiblePhotos);
  const showMorePhotos = (event) => {
    setVisiblePhotos(event.photos.length);
  };

  const showLessPhotos = () => {
    setVisiblePhotos(maxVisiblePhotos);
  };

  return (
    <>
      <h1>கடந்த காலங்களில் வழங்கப்பட்ட உதவிகள்</h1>
      <div className="cardContainer">
        {pastEvents.map((event, index) => (
          <Card key={index} className="card">
            <CardContent className="cardContent">
              <Typography variant="h6" component="div" className="projectName">
                {event.projectName}
              </Typography>
              <Grid container spacing={2} justifyContent="center" className="photoGrid">
                {event.photos.slice(0, visiblePhotos).map((photo, photoIndex) => (
                  <Grid item xs={12} sm={6} md={4} lg={6} key={photoIndex} className="photoItem">
                    <CardMedia
                      component="img"
                      alt={`Project ${event.projectName} - Photo ${photoIndex + 1}`}
                      height="100%"
                      width="60%"
                      image={photo}
                      className="photo"
                    />
                  </Grid>
                ))}
              </Grid>
              {event.photos.length > maxVisiblePhotos && (
                <div className="buttonContainer">
                  {visiblePhotos < event.photos.length ? (
                    <>
                      <button
                        onClick={() => showMorePhotos(event)}
                        className="button"
                      >
                        மேலும் பார்க்க
                      </button>
                    </>
                  ) : (
                    <button onClick={showLessPhotos} className="button">
                      குறைவாக பார்க்க
                    </button>
                  )}
                </div>
              )}
              <Typography variant="body2" color="text.secondary" className="description">
                {event.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export default PastProject;
