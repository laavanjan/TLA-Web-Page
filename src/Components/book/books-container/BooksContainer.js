import React, { useState, useEffect } from "react";
import "./booksContainer.css";
import { Container } from "@material-ui/core";

const BooksContainer = () => {
    const [loading, setLoading] = useState(false);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/books');

                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }

                const data = await response.json();
                setBooks(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
        setTimeout(() => {
            setLoading(true);
        }, 500);
    }, []);

    const handleOpen = (book) => {
        window.open(book.pdfUrl, '_blank');
    };

    return (
        <Container className="books-container">
            <div className="book-sub-container">
                <p className="sub-heading">தமிழ் இலக்கிய மன்றத்தின் வெளியீடுகள்</p>
                <hr class="underline"></hr>
                <div className="books">
                    {books
                        .filter(book => book.isTlaBook && book.isAccept)
                        .sort((a, b) => a.year - b.year)
                        .map((book) => {
                            return (
                                <>
                                    <div className={loading ? "book-card fade-in" : "book-card"} onClick={() => handleOpen(book)}>
                                        <img src={book.img} alt="book" className="book-img" />
                                        <p className="book-name">{book.bookName}</p>
                                        <p className="book-year">{book.year}</p>
                                    </div>
                                </>
                            )
                        })
                    }
                </div>
            </div>
            <div className="book-sub-container">
                <p className="sub-heading">பல்கலைக்கழக மாணவர்களின் வெளியீடுகள்</p>
                <hr class="underline"></hr>
                <div className="books">
                    {books
                        .filter(book => !book.isTlaBook && book.isAccept)
                        .sort((a, b) => a.year - b.year)
                        .map((book) => {
                            return (
                                <>
                                    <div className={loading ? "book-card fade-in" : "book-card"} onClick={() => handleOpen(book)}>
                                        <img src={book.img} alt="book" className="book-img" />
                                        <p className="book-name">{book.bookName}</p>
                                        <p className="book-author">{book.author}</p>
                                    </div>
                                </>
                            )
                        })
                    }
                </div>
            </div>
        </Container>
    )
}

export default BooksContainer;