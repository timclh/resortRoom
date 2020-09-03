import React from 'react'
import Hero from "../components/Hero";
import Banner from "../components/Banner";
import { Link } from "react-router-dom";
import Services from "../components/Services";
import FeaturedRooms from '../components/FeaturedRooms';

export default function Home() {
    return (
        <>
            <Hero>
                <Banner
                    // title="luxurious rooms"
                    title="Welcom to Author and Reader"
                    // subtitle="deluxe rooms starting at $299"
                    subtitle="You can find the most suitable books for you"
                >
                    <Link to="/rooms" className="btn-primary">
                        Books
          </Link>
                </Banner>
            </Hero>
            {/* <Services /> */}
            <FeaturedRooms />
        </>);
}
