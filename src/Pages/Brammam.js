import { Helmet } from "react-helmet";
import BrammamIntro from "../Components/events/brammam/intro/BrammamIntro";
const Brammam = () => {
    return (
        <>
            <Helmet>
                <title>பிரம்மம் | தமிழ் இலக்கிய மன்றம்</title>
                <meta name="description" content="" />
                <meta name="keywords" content="TLA, Tamil Literary Association, Brammam" />
            </Helmet>
            <BrammamIntro />
        </>
    );
}

export default Brammam