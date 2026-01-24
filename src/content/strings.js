// Centralized content management for Beach Resort
// All static strings in one place for easy updates and future i18n support

export const STRINGS = {
  // Site info
  site: {
    name: "Beach Resort",
    tagline: "Luxury Rooms & Vacation Rentals"
  },

  // Navigation
  nav: {
    home: "Home",
    rooms: "Rooms",
    about: "About Us",
    contact: "Contact"
  },

  // Home page
  home: {
    heroTitle: "Luxurious Rooms",
    heroSubtitle: "Deluxe rooms starting at $299",
    ctaButton: "Our Rooms",
    servicesTitle: "Services"
  },

  // Rooms page
  rooms: {
    heroTitle: "Our Rooms",
    backButton: "Return Home",
    filterTitle: "Search Rooms",
    noResults: "Unfortunately no rooms matched your search parameters",
    perNight: "per night"
  },

  // Room details
  roomDetails: {
    detailsTitle: "Details",
    infoTitle: "Info",
    priceLabel: "Price",
    sizeLabel: "Size",
    sizeUnit: "SQFT",
    capacityLabel: "Max Capacity",
    capacityUnit: "people",
    petsAllowed: "Pets allowed",
    noPets: "No pets allowed",
    breakfastIncluded: "Free breakfast included",
    extrasTitle: "Extras",
    notFound: "No such room could be found...",
    backToRooms: "Back to Rooms"
  },

  // Filter labels
  filter: {
    roomType: "Room Type",
    allTypes: "All",
    guests: "Guests",
    price: "Room Price",
    roomSize: "Room Size",
    breakfast: "Breakfast",
    pets: "Pets"
  },

  // Loading states
  loading: {
    rooms: "Rooms data loading....",
    general: "Loading..."
  },

  // Error page
  error: {
    title: "Oops! Page Not Found",
    message: "The page you are looking for does not exist.",
    backButton: "Return Home"
  }
};

export default STRINGS;
