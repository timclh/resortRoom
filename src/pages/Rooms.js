import React from "react";
import Hero from "../components/Hero";
import Banner from "../components/Banner";
import { Link } from "react-router-dom";
import RoomsContainer from "../components/RoomsContainer";
import { usePageTitle } from "../hooks/usePageTitle";

const Rooms = () => {
  usePageTitle("Our Rooms", "Browse our selection of luxury rooms including single, double, family, and presidential suites. Find the perfect accommodation for your stay.");

  return (
    <>
      <Hero hero="roomsHero">
        <Banner title="our rooms">
          <Link to="/" className="btn-primary">
            return home
          </Link>
        </Banner>
      </Hero>
      <RoomsContainer />
    </>
  );
};

export default Rooms;
