import { Helmet } from "react-helmet";
import PplIntro from "../Components/events/ppl/intro/PplIntro";
import PplScore from "../Components/events/ppl/score/PplScore";
import PplTeams from "../Components/events/ppl/teams/PplTeams";
import PplGallery from "../Components/events/ppl/pplGallery/PplGallery";

const PPL = () => {
    return (
        <>
            <Helmet>
                <title>பொங்கல் Premier Leaque | தமிழ் இலக்கிய மன்றம்</title>
                <meta name="description" content="மொரட்டுவ பல்கலைக்கழக தமிழ் மாணவர்களிடையே இடைத்தொடர்புகளை ஏற்படுத்த நடாத்தப்படும் துடுப்பாட்டநிகழ்வு." />
                <meta name="keywords" content="PPL, Tamil Literary Association, PPL" />
            </Helmet>
            <PplIntro />
            <PplScore />
            <PplTeams />
            <PplGallery />
        </>
    )
}

export default PPL;
