/* eslint-disable no-undef */
import React, { Component } from 'react';
import L from 'leaflet';
import Joi from 'joi';
import {
	Map, TileLayer, Marker, Popup
} from 'react-leaflet';
import {
	Card, Form, CardText, FormGroup, CardTitle, Label, Button, Input,
} from 'reactstrap';

import './App.css';

const spinner = require('../spinner.svg');
const iconUrl = require('../user-marker.svg');
const userLocationIcon = require('../user-location.svg');

const mapIcon = L.icon({
	iconUrl,
	iconSize: [35, 51],
	iconAnchor: [22, 94],
	popupAnchor: [-10, -90],
});

const messageIcon = L.icon({
	iconUrl: userLocationIcon,
	iconSize: [35, 51],
	iconAnchor: [22, 94],
	popupAnchor: [-10, -90],
});

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/v1/messages' : 'production-url.com';

const schema = Joi.object().keys({
	name: Joi.string().regex(/^[a-zA-Z0-9 -_]{1,100}$/).min(1).max(100)
		.required(),
	message: Joi.string().min(1).max(500)
		.required()
});

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			location: {
				lat: 51.505,
				lng: -0.09,
			},
			havUsersLocation: false,
			zoom: 1,
			userMessage: {
				name: '',
				message: '',
			},
			sendingMessage: false,
			sentMessage: false,
			messages: [],
		};
	}

	componentDidMount() {
		fetch(API_URL)
			.then(res => res.json())
			.then(messages => {
				const haveSeenLocation = {};
				messages = messages.reduce((all, message) => {
					const key = `${message.latitude}${message.longitude}`;
					if(haveSeenLocation[key]) {
						haveSeenLocation[key].otherMessages = haveSeenLocation[key].otherMessages || [];
						haveSeenLocation[key].otherMessages.push(message);
					} else {
						haveSeenLocation[key] = message;
						all.push(message);
					}

					return all;
				}, []);
				this.setState({ messages });
			});

		navigator.geolocation.getCurrentPosition((position) => {
			this.setState({
				location: {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				},
				havUsersLocation: true,
				zoom: 15,
			});
		}, () => {
			fetch('https://ipapi.co/json').then(res => res.json()).then((location) => {
				this.setState({
					location: {
						lat: location.latitude,
						lng: location.longitude,
					},
					havUsersLocation: true,
					zoom: 15,
				});
			});
		});
	}

	formIsValid = () => {
		const { userMessage, havUsersLocation } = this.state;

		const userMessageObj = {
			name: userMessage.name,
			message: userMessage.message
		};

		const result = Joi.validate(userMessageObj, schema);

		return !result.error && havUsersLocation ? true : false;
	}

	formSubmitted = (event) => {
		event.preventDefault();
		const { userMessage, location } = this.state;

		if(this.formIsValid()) {
			this.setState({ sendingMessage: true });
			fetch(API_URL, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
				},
				body: JSON.stringify({
					name: userMessage.name,
					message: userMessage.message,
					latitude: location.lat,
					longitude: location.lng,
				})
			})
				.then(res => res.json())
				.then(message => {
					console.log(message);

					setTimeout(() => {
						this.setState({
							sendingMessage: false,
							sentMessage: true
						});
					}, 1000);
				});
		}
	}

	valueChange = (event: Event) => {
		const {name, value} = event.target;

		this.setState((prevState) => {
			return {
				userMessage: {
					...prevState.userMessage,
					[name]: value
				}
			};
		});
	}

	render() {
		const { location, zoom, havUsersLocation, sendingMessage, sentMessage, messages } = this.state;
		const position = [location.lat, location.lng];

		return (
			<div className="map">
				<Map
					className="map"
					center={position}
					zoom={zoom}
				>
					<TileLayer
						attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					{ havUsersLocation
            && (
            	<Marker position={position} icon={mapIcon} />
            )
					}
					{ messages.map(message => (
						<Marker
							key={message._id}
							position={[message.latitude, message.longitude]}
							icon={messageIcon}
						>
							<Popup>
								<p><em>{message.name}: </em>{message.message}</p>
								{message.otherMessages && message.otherMessages.map(message => <p key={message._id}><em>{message.name}: </em>{message.message}</p>)}
							</Popup>
						</Marker>
					)) }
				</Map>
				<div className="message-form">
					<Card body>
						<CardTitle>Welcome to Guest Map</CardTitle>
						<CardText>Leave your message with your location</CardText>
						{ !sendingMessage && !sentMessage && havUsersLocation ?
							<Form onSubmit={this.formSubmitted}>
								<FormGroup>
									<Label for="name">Name</Label>
									<Input onChange={this.valueChange} type="text" name="name" placeholder="Enter your name" />
								</FormGroup>
								<FormGroup>
									<Label for="message">Message</Label>
									<Input onChange={this.valueChange} type="textarea" name="message" placeholder="Enter a message" />
								</FormGroup>
								<Button color="info" disabled={!this.formIsValid()}>Send</Button>
							</Form> :
							sendingMessage || !havUsersLocation ? <img src={spinner} alt="Spinner"/> : <CardText>Thanks for submitting a message</CardText>
						}
					</Card>
				</div>
			</div>
		);
	}
}

export default App;
