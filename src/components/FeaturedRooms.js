import React, { Component } from 'react'
import { RoomContext } from '../context'
import Loading from "./Loading";
import Room from './Room';
import Title from "./Title";


export default class FeaturedRooms extends Component {
    static contextType = RoomContext;
    render() {
        let { loading, featuredRooms: rooms } = this.context;
        rooms = rooms.map(room => {
            return <Room key={room.id} room={room} />;
        });
        // const value = this.context;
        // console.log(rooms)
        return (
            <section className="featured-rooms">
                {/* {greeting} {name} */}
                {/* from featured Rooms
                <Room /> */}
                <Title title="featured books" />
                <div className="featured-rooms-center">
                    {loading ? <Loading /> : rooms}
                </div>
                {/* <Loading /> */}
            </section>
        )
    }
}
