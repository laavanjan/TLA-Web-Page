import { Grid, Typography } from "@mui/material";
import { SampleDetails } from "./SampleDetails";
import "./Seniors.css";
import SeniorsCards from "./SeniorsCards";

const SeniorsDetails = () => {
    const categorizedDetails = SampleDetails.reduce((acc, current) => {
        if (!acc[current.category]) {
            acc[current.category] = [];
        }
        acc[current.category].push(current);

        return acc;
    }, {});

    return (
        <Grid
            container
            paddingX={{ xs: "4%", md: "8%" }}
            paddingY={4}
            spacing={4}
        >
            {Object.keys(categorizedDetails).map((category) => (
                <Grid key={category} item xs={12}>
                    <Typography fontSize={20} color={"#002245"}>
                        {category}
                    </Typography>
                    <hr className="underline" />

                    <Grid container spacing={4}>
                        {categorizedDetails[category].map((person) => (
                            <Grid
                                key={person.id}
                                item
                                xs={12}
                                md={6}
                                display={"flex"}
                                justifyContent={"center"}
                            >
                                <SeniorsCards
                                    name={person.name}
                                    picture={person.picture}
                                    degree={person.degree}
                                    work={person.work}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            ))}
        </Grid>
    );
};

export default SeniorsDetails;
