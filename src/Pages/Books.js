import React from "react";

import BooksContainer from "../Components/book/books-container/BooksContainer";
import Intro from "../Components/book/intro/Intro";

const Books = () => {
    return (
        <div>
        <Intro />
        <BooksContainer />
        </div>
    );
    }

export default Books;