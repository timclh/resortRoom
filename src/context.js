import React, { Component } from 'react'
import items from "./data"

const RoomContext = React.createContext();

export default class RoomProvider extends Component {
    state = {
        // name: "john",
        // greeting: "hello",
        rooms: [],
        sortedRooms: [],
        featuredRooms: [],
        loading: true,
    };

    componentDidMount() {
        // this.getData();
        let rooms = this.formatData(items);
        let featuredRooms = rooms.filter(room => room.featured === true);
        this.setState({
            rooms,
            featuredRooms,
            sortedRooms: rooms,
            loading: false,
            //
            // price: maxPrice,
            // maxPrice,
            // maxSize
        });
    }

    formatData(items) {
        let tempItems = items.map(item => {
            let id = item.sys.id;
            let images = item.fields.images.map(image => image.fields.file.url);

            let room = { ...item.fields, images, id };
            return room;
        });
        return tempItems;
    }
    getRoom = slug => {
        let tempRooms = [...this.state.rooms];
        const room = tempRooms.find(room => room.slug === slug);
        return room;
    };

    render() {
        return (
            <RoomContext.Provider
                value=
                {{
                    ...this.state,
                    getRoom: this.getRoom,
                    // handleChange: this.handleChange
                }}
            >
                {this.props.children}
            </RoomContext.Provider>
        )
    }
}

const RoomConsumer = RoomContext.Consumer;
export { RoomProvider, RoomConsumer, RoomContext };