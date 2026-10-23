import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import items from "./data";

const RoomContext = createContext();

const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [sortedRooms, setSortedRooms] = useState([]);
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    type: "all",
    capacity: 1,
    price: 0,
    minPrice: 0,
    maxPrice: 0,
    minSize: 0,
    maxSize: 0,
    breakfast: false,
    pets: false
  });

  // Format data from Contentful structure
  const formatData = useCallback((items) => {
    return items.map(item => {
      const id = item.sys.id;
      const images = item.fields.images.map(image => image.fields.file.url);
      return { ...item.fields, images, id };
    });
  }, []);

  // Initialize rooms data
  useEffect(() => {
    const formattedRooms = formatData(items);
    const featured = formattedRooms.filter(room => room.featured === true);
    const maxPrice = Math.max(...formattedRooms.map(item => item.price));
    const maxSize = Math.max(...formattedRooms.map(item => item.size));

    setRooms(formattedRooms);
    setFeaturedRooms(featured);
    setSortedRooms(formattedRooms);
    setFilters(prev => ({
      ...prev,
      price: maxPrice,
      maxPrice,
      maxSize
    }));
    setLoading(false);
  }, [formatData]);

  // Filter rooms whenever filters change
  useEffect(() => {
    if (rooms.length === 0) return;

    let tempRooms = [...rooms];
    const { type, capacity, price, minSize, maxSize, breakfast, pets } = filters;

    // Filter by type
    if (type !== "all") {
      tempRooms = tempRooms.filter(room => room.type === type);
    }
    // Filter by capacity
    if (parseInt(capacity) !== 1) {
      tempRooms = tempRooms.filter(room => room.capacity >= parseInt(capacity));
    }
    // Filter by price
    tempRooms = tempRooms.filter(room => room.price <= parseInt(price));
    // Filter by size
    tempRooms = tempRooms.filter(
      room => room.size >= minSize && room.size <= maxSize
    );
    // Filter by breakfast
    if (breakfast) {
      tempRooms = tempRooms.filter(room => room.breakfast === true);
    }
    // Filter by pets
    if (pets) {
      tempRooms = tempRooms.filter(room => room.pets === true);
    }

    setSortedRooms(tempRooms);
  }, [rooms, filters]);

  // Get single room by slug - memoized
  const getRoom = useCallback((slug) => {
    return rooms.find(room => room.slug === slug);
  }, [rooms]);

  // Handle filter changes - memoized
  const handleChange = useCallback((event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Replace the whole search at once, e.g. from the AI concierge. Anything not
  // given goes back to its default, so each request is a fresh search.
  const applyFilters = useCallback(({
    type = "all",
    guests = 1,
    maxPrice = null,
    minSize = null,
    breakfast = false,
    pets = false
  } = {}) => {
    const types = new Set(rooms.map(room => room.type));
    const capacities = [...new Set(rooms.map(room => room.capacity))].sort((a, b) => a - b);
    // The guests filter means "sleeps at least this many". Snap up to a size
    // that exists in the dropdown (7 guests and 10 guests match the same rooms);
    // a party bigger than any room is kept as is and matches nothing.
    const fitting = capacities.find(capacity => capacity >= guests);

    setFilters(prev => ({
      ...prev,
      type: types.has(type) ? type : "all",
      capacity: fitting === undefined ? guests : fitting,
      price: maxPrice === null ? prev.maxPrice : Math.min(maxPrice, prev.maxPrice),
      minSize: minSize === null ? 0 : minSize,
      breakfast,
      pets
    }));
  }, [rooms]);

  const resetFilters = useCallback(() => applyFilters(), [applyFilters]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    rooms,
    sortedRooms,
    featuredRooms,
    loading,
    ...filters,
    getRoom,
    handleChange,
    applyFilters,
    resetFilters
  }), [rooms, sortedRooms, featuredRooms, loading, filters, getRoom, handleChange, applyFilters, resetFilters]);

  return (
    <RoomContext.Provider value={contextValue}>
      {children}
    </RoomContext.Provider>
  );
};

const RoomConsumer = RoomContext.Consumer;

export { RoomProvider, RoomConsumer, RoomContext };

export function withRoomConsumer(Component) {
  return function ConsumerWrapper(props) {
    return (
      <RoomConsumer>
        {value => <Component {...props} context={value} />}
      </RoomConsumer>
    );
  };
}

export default RoomProvider;
