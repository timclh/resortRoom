import React, { memo, useContext, useMemo } from "react";
import Title from "./Title";
import { RoomContext } from "../context";
import Room from "./Room";
import Loading from "./Loading";

const FeaturedRooms = memo(() => {
  const { loading, featuredRooms } = useContext(RoomContext);

  const rooms = useMemo(() =>
    featuredRooms.map(room => <Room key={room.id} room={room} />),
    [featuredRooms]
  );

  return (
    <section className="featured-rooms">
      <Title title="featured rooms" />
      <div className="featured-rooms-center">
        {loading ? <Loading /> : rooms}
      </div>
    </section>
  );
});

export default FeaturedRooms;
