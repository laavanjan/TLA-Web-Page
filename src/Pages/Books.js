import React from "react";
import { Helmet } from "react-helmet";

import BooksContainer from "../Components/book/books-container/BooksContainer";
import Intro from "../Components/book/intro/Intro";
import SubmitArticleBanner from "../Components/book/submit-banner/SubmitArticleBanner";

const Books = () => {
    return (
        <div>
        <Helmet>
            <title>நூல்கள் | தமிழ் இலக்கிய மன்றம்</title>
            <meta
                name="description"
                content="தமிழ் இலக்கிய மன்றத்தின் நூல்கள் மற்றும் படைப்பு சமர்ப்பிப்பு"
            />
            <meta
                name="keywords"
                content="TLA, Tamil Literary Association, Books, தமிழருவி"
            />
        </Helmet>
        <Intro />
        <BooksContainer />
        <SubmitArticleBanner />
        </div>
    );
    }

export default Books;