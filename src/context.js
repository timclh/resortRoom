import React, { Component } from 'react'
import items from "./data"

const RoomContext = React.createContext();

export default class RoomProvider extends Component {
    state = {
        // rooms: [],
        // sortedRooms: [],
        // featuredRooms: [],
        // loading: true,
    };

    render() {
        return (
            <RoomContext.Provider
                value="hello world"
            // {{
            //     ...this.state,
            // getRoom: this.getRoom,
            // handleChange: this.handleChange
            // }}
            >
                {this.props.children}
            </RoomContext.Provider>
        )
    }
}

const RoomConsumer = RoomContext.Consumer;
export { RoomProvider, RoomConsumer, RoomContext };