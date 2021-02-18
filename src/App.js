/**
 * @file App.js
 * @desc Gateway-Panel
 * @author AH
 */

// First-Party
import Routes from "./Routes";
import { AppContext } from "./libs/contextLib";
import Auth from "./Components/Auth";
import { onError } from "./libs/errorLib";
import './App.css';

// Third-Party
import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";
import { useHistory } from "react-router-dom";

// Code
function App() {
	const [isAuthenticating, setIsAuthenticating] = useState(true);
	const [isAuthenticated, userHasAuthenticated] = useState(false);

	const history = useHistory();

	useEffect(() => {
		onLoad();
	}, []);

	async function onLoad() {
		try {
			await Auth.currentSession();
			userHasAuthenticated(true);
		}
		catch(e) {
			onError(e);
		}

		setIsAuthenticating(false);
	}

	async function handleLogout() {
		await Auth.signOut();

		userHasAuthenticated(false);

		history.push("/login");
	}

	return (
		!isAuthenticating && (
			<div className="App container py-3">
				<Navbar collapseOnSelect bg="light" expand="md" className="mb-3">
					<LinkContainer to="/">
						<Navbar.Brand className="font-weight-bold text-muted">
							Turnierverwaltung
						</Navbar.Brand>
					</LinkContainer>
					<Navbar.Toggle />
					<Navbar.Collapse className="justify-content-end">
						<Nav activeKey={window.location.pathname}>
							{isAuthenticated ? (
								<>
									<LinkContainer to="/personen">
										<Nav.Link>Personenverwaltung</Nav.Link>
									</LinkContainer>
									<LinkContainer to="/mannschaften">
										<Nav.Link>Mannschaftsverwaltung</Nav.Link>
									</LinkContainer>
									<LinkContainer to="/turniere">
										<Nav.Link>Turnierverwaltung</Nav.Link>
									</LinkContainer>
									<Nav.Link onClick={handleLogout}>Logout</Nav.Link>
								</>
							) : (
								<>
									<LinkContainer to="/signup">
										<Nav.Link>Signup</Nav.Link>
									</LinkContainer>
									<LinkContainer to="/login">
										<Nav.Link>Login</Nav.Link>
									</LinkContainer>
								</>
							)}
						</Nav>
					</Navbar.Collapse>
				</Navbar>
				<AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
					<Routes />
				</AppContext.Provider>
			</div>
		)
	);
}

export default App;
