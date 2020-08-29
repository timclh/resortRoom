import React, { Component } from 'react'
import { RoomContext } from '../context'

export default class FeaturedRooms extends Component {
    static contextType = RoomContext;
    render() {
        // const { name, greeting } = this.context;
        const value = this.context;
        console.log(value)
        return (
            <div>
                {/* {greeting} {name} */}
                from featured Rooms {value}
            </div>
        )
    }
}
