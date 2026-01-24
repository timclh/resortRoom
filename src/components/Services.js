import React, { memo, useMemo } from "react";
import { FaCocktail, FaHiking, FaShuttleVan, FaBeer } from "react-icons/fa";
import Title from "./Title";

const SERVICES_DATA = [
  {
    icon: <FaCocktail />,
    title: "Free Cocktails",
    info: "Unwind with our complimentary signature cocktails, served daily at sunset in our poolside lounge. Our expert mixologists craft refreshing drinks using locally-sourced ingredients."
  },
  {
    icon: <FaHiking />,
    title: "Endless Hiking",
    info: "Explore miles of scenic trails right from our doorstep. Our concierge provides guided hiking tours, trail maps, and packed lunches for your outdoor adventures."
  },
  {
    icon: <FaShuttleVan />,
    title: "Free Shuttle",
    info: "Enjoy complimentary shuttle service to local attractions, shopping centers, and the airport. Scheduled departures every 30 minutes from 6 AM to 10 PM."
  },
  {
    icon: <FaBeer />,
    title: "Craft Beer Selection",
    info: "Discover our curated selection of local craft beers at our resort brewery. Join our daily tasting sessions and learn about regional brewing traditions."
  }
];

const Services = memo(() => {
  const serviceItems = useMemo(() =>
    SERVICES_DATA.map(item => (
      <article key={`service-${item.title}`} className="service">
        <span>{item.icon}</span>
        <h6>{item.title}</h6>
        <p>{item.info}</p>
      </article>
    )),
    []
  );

  return (
    <section className="services">
      <Title title="services" />
      <div className="services-center">
        {serviceItems}
      </div>
    </section>
  );
});

export default Services;
