import Agenda from "../Components/events/thaipongal/agenda/Agenda";
import PongalIntro from "../Components/events/thaipongal/intro/PongalIntro";
import PongalGallery from "../Components/events/thaipongal/pongalGallery/PongalGallery";
import Sponsors from "../Components/events/thaipongal/sponsors/Sponsors";
import { Helmet } from "react-helmet";

const Thaipongal = () => {
    return (
        <>
            <Helmet>
                <title>தைப்பொங்கல் | தமிழ் இலக்கிய மன்றம்</title>
                <meta name="description" content="மதபேதமின்றி சூரியனுக்கும் விளைச்சலுக்கும் உதவிய கால்நடைகளுக்கு நன்றி கூறும் முகமாக தைமாதம் பல்கலைகழக வளாகத்தினுள் பாரம்பரியத்தை பறைசாற்றும் வகையில் பொங்கல் பொங்கி பாரம்பரிய கலாச்சார உடையில் தீப்பண்டங்களை விருந்தோம்பல் செய்து பாரம்பரிய தமிழர் விளையாட்டுக்களுடன் விழாக்கோலம் கானும்." />
                <meta name="keywords" content="TLA, Tamil Literary Association, Thai Pongal" />
            </Helmet>
                <PongalIntro />
                {/* <Agenda /> */}
                {/* <Sponsors /> */}
                <PongalGallery />
        </>
    );
}

export default Thaipongal;