import { Box, Stack, Typography } from "@mui/material";

const SeniorsCards = ({ name, picture, degree, work }) => {
    return (
        <Box
            bgcolor={"#E3E7EB"}
            borderRadius={3}
            boxShadow={"0px 2px 2px gray"}
            width={"fit-content"}
        >
            <Stack direction="row" spacing={2} padding={4}>
                <Stack direction="column" justifyContent={"center"}>
                    <img
                        src={picture}
                        alt="Profile"
                        width={"100px"}
                        height={"100px"}
                    />
                </Stack>
                <Stack direction="column" justifyContent={"space-between"}>
                    <Box>
                        <Typography
                            color={"#002245"}
                            fontSize={18}
                            fontWeight={"bold"}
                        >
                            {name}
                        </Typography>
                        <Typography color={"#002245"}>{degree}</Typography>
                    </Box>
                    <Typography color={"#002245"}>{work}</Typography>
                </Stack>
                <Stack
                    direction="column"
                    justifyContent={"end"}
                    paddingLeft={{ xs: 2, md: 6 }}
                >
                    <button className="seeMore">See More</button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default SeniorsCards;
