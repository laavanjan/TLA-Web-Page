import React from "react";

import BooksContainer from "../Components/book/books-container/BooksContainer";
import Intro from "../Components/book/intro/Intro";
import SubmitArticleBanner from "../Components/book/submit-banner/SubmitArticleBanner";

const Books = () => {
    return (
        <div>
        <Intro />
        <BooksContainer />
        <SubmitArticleBanner />
        </div>
    );
    }

export default Books;