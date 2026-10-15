import React from "react";
import { useNavigate } from "react-router-dom";
import "./booksContainer.css";
import { Container } from "@material-ui/core";
import { useListedBooks, coverUrl } from "../../../book/books";

// The books come from the Supabase `books` table, managed at /admin/books
// (see src/book/books.js). Each card opens the book's /books/:slug page.
const BooksContainer = () => {
    const navigate = useNavigate();
    const books = useListedBooks();
    const loaded = books !== null;

    const tlaBooks = (books || []).filter(book => book.category === "tla");
    const studentBooks = (books || []).filter(book => book.category === "student");

    const card = (book, extra) => (
        <div key={book.slug} className={loaded ? "book-card fade-in" : "book-card"} onClick={() => navigate(`/books/${book.slug}`)}>
            <div className="book-img-wrap">
                <img src={coverUrl(book)} alt={book.title} className="book-img" loading="lazy" />
            </div>
            <p className="book-name">{book.title}</p>
            {extra}
        </div>
    );

    return (
        <Container className="books-container">
            <div className="book-sub-container">
                <p className="sub-heading">தமிழ் இலக்கிய மன்றத்தின் வெளியீடுகள்</p>
                <hr className="underline"></hr>
                <div className="books">
                    {tlaBooks.map(book => card(book, book.year ? <p className="book-year">{book.year}</p> : null))}
                </div>
            </div>
            {studentBooks.length > 0 && (
                <div className="book-sub-container">
                    <p className="sub-heading">பல்கலைக்கழக மாணவர்களின் வெளியீடுகள்</p>
                    <hr className="underline"></hr>
                    <div className="books">
                        {studentBooks.map(book => card(book, book.author ? <p className="book-author">{book.author}</p> : null))}
                    </div>
                </div>
            )}
        </Container>
    )
}

export default BooksContainer;
