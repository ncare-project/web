import React, { Component } from 'react'
import MenuBar from '../MenuBar/MenuBar'
import { YMaps, Map, Placemark, GeoObject } from 'react-yandex-maps'

export default class ReportsMap extends Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedPoint: null,
            markers: [
                {
                    name: 'testdsgdsgds',
                    coordinates: [55.7, 37.6],
                    radius: 10000
                }
            ]
        }

        this.handleInfoEdit = this.handleInfoEdit.bind(this)
        this.getZones = this.getZones.bind(this)
        
        this.getZones()
    }

    getZones() {
        window.socket.emit('orgs:zones')

        window.socket.on('orgs:zones', data => {
            console.log(data)
            if (!data.res) { 
                // Положительный ответ от сервера
                this.setState({
                    markers: data.zones.map(
                        zone => ({
                                name: zone.name,
                                coordinates: zone.location.coordinates,
                                radius: zone.radius
                        })
                    )
                })
            }
        })
    }

    handleInfoEdit() {
        if (this.state.selectedPoint) {
            const selectedPoint = this.state.selectedPoint
            
            window.socket.emit('orgs:create_zone', {
                name: this.nameInput.value,
                coordinates: this.state.markers[selectedPoint].coordinates,
                radius: Number(this.radiusInput.value)
            })

            window.socket.on('orgs:create_zone', data => {
                if (!data.res) { 
                    // Положительный ответ от сервера
                    this.setState(prevState => {
                        let newMarkers = prevState.markers
                        newMarkers[this.state.selectedPoint] = {
                            name: data.zone.name,
                            coordinates: data.zone.coordinates,
                            radius: data.zone.radius
                        }

                        return {
                            markers: newMarkers
                        }
                    })

                }
            })
        }
    }

    render() {
        return (
            <div className='two-columns
            '>
                <MenuBar handleUserExit={this.props.handleUserExit} sideMenu isSignedIn={this.props.isSignedIn}>
                    <input ref={node => this.nameInput = node}></input>
                    <input ref={node => this.radiusInput = node}></input>
                    <button onClick={this.handleInfoEdit}>Submit</button>
                </MenuBar>

                <YMaps>
                    <Map width={'100%'} height={'100vh'} 
                        defaultState={{ center: [55.75, 37.57], zoom: 9 }}
                        onClick={e => this.setState(prevState => ({
                            selectedPoint: prevState.markers.length,
                            markers: prevState.markers.concat({
                                name: '',
                                coordinates: e.get('coords'),
                                radius: 0
                            })
                        }))}>
                            {this.state.markers.map((marker, index) => (
                                <>
                                    <GeoObject
                                        onClick={() => {
                                            this.setState({
                                                selectedPoint: index
                                            })
                                        }}
                                        geometry={{
                                            type: 'Point',
                                            coordinates: marker.coordinates
                                        }}
                                        properties={{
                                            iconContent: marker.name.slice(0, 10)
                                        }}
                                        options={{
                                            preset: `islands#${index === this.state.selectedPoint ? 'blue' : 'grey'}StretchyIcon`,
                                        }}
                                    />
                                    <GeoObject 
                                        geometry={{
                                            type: 'Circle',
                                            coordinates: marker.coordinates,
                                            radius: marker.radius
                                        }}
                                    />
                                </>
                            ))}
                    </Map>
                </YMaps>
            </div>
        )
    }
}