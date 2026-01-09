import SeniorsDetails from "../Components/Seniors/SeniorsDetails";
import { guidance } from "../shared/EventDetails";
import Intro from "../shared/intro/Intro";

const Seniors = () => {
    return (
        <>
            <Intro event={guidance[1]} />
            <SeniorsDetails />
        </>
    );
};

export default Seniors;
