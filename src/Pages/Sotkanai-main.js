import { Helmet } from "react-helmet";
import SotkanaiIntro from "../Components/events/sotkanai/intro/sotkanaiIntro";
import Sponsors from "../Components/events/sotkanai/sponsers/Sponsers";
// import ImageGallery from "../Components/events/sotkanai/gallery/DistrictImage";
import MainGalleryComponent from "../Components/events/sotkanai/gallery/MainGalleryComponent";
import SotkanaiRules from "../Components/events/sotkanai/rules/Rules";
import Agenda from "../Components/events/sotkanai/agenda/Agenda";
import Winners2024 from "../Components/events/sotkanai/sotkanai2024-winners/Sotkanai2024Wniiers";

const SotkanaiMain = () => {
    return (
        <>
        {/* Hello World Reply */}
            <Helmet>
                <title>சொற்கணை | தமிழ் இலக்கிய மன்றம்</title>
                <meta name="description" content="சொற்கணை என்பது மாபெரும் விவாதச்சமர். இலங்கையின் 25 மாவட்டங்களில் தேர்வு செய்யப்பட்ட சிறந்த விவாத அணிகள் சொல் எனும் கணை கொண்டு களமாடும் இறுதிகட்ட விவாத சமர் தலை நகரில் பிரதான மண்டபத்தில் பல்லாயிரக்கணக்கானோர் முன்னிலையில் மிகவும் கோலாகலமாக நடைபெறுவதாகும்." />
                <meta name="keywords" content="TLA, Tamil Literary Association, Sotknai" />
            </Helmet>
            <SotkanaiIntro />
            <Winners2024/>
            {/* <Agenda /> */}
            {/* <Sponsors/> */}
            <SotkanaiRules/>
            <MainGalleryComponent/>
        </>
    );

}
export default SotkanaiMain;
