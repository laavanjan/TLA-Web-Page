import React from 'react'
import { Container } from '@mui/material'
import Navbar from '../Components/Home/Navbar/navbar'
import Landing from '../Components/Home/Landing/landing'
import Intro from '../Components/Home/Intro/intro'
import Event from '../Components/Home/Event/event'
import MembersBanner from '../Components/Home/Event/MembersBanner'
import Gallery from '../Components/Home/Gallery/gallery'
import Timeline from '../Components/Home/Timeline/Timeline'
import LotusProgress from '../Components/Home/LotusProgress'
import '../Components/Home/homeFx.css'
import { Helmet } from 'react-helmet'
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Home() {
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const element = document.querySelector(location.hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    return (
        <>
            <Helmet>
                <title>தமிழ் இலக்கிய மன்றம் | Tamil Literary Association, University of Moratuwa (TLA UoM)</title>
                <meta
                    name="description"
                    content="Tamil Literary Association (TLA) of the University of Moratuwa, Sri Lanka — organisers of Tamilaruvi, the Sorkanai debate series and community help projects. மொறட்டுவைப் பல்கலைக்கழக தமிழ் இலக்கிய மன்றம்."
                />
                <meta
                    name="keywords"
                    content="TLA, TLA UoM, Tamil Literary Association, Thamizh Literary Association, moratuwa, uom, university of moratuwa, tamil, tamizharuvi"
                />
            </Helmet>
            <Landing />
            <Intro />
            <Event />
            <MembersBanner />
            {/* <Gallery /> */}
            {/* <Timeline /> */}
            {/* The contact section lives on its own page now (/contact); the
                site footer carries the contact details on every page. */}
            <LotusProgress />
        </>)
}
export default Home
