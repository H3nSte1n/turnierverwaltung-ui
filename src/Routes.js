/**
 * @file Routes.js
 * @desc Handeling Routes of the App
 * @author AH
 */

// First-Party
import Home from "./Containers/Home";
import NotFound from "./Containers/NotFound";
import Login from "./Containers/Login";
import Signup from "./Containers/Signup";
import Personenverwaltung from './Containers/Personenverwaltung';
import Mannschaftsverwaltung from './Containers/Mannschaftsverwaltung';
import Turnierverwaltung from './Containers/Turnierverwaltung';
import AuthenticatedRoute from "./Components/AuthenticatedRoute";
import UnauthenticatedRoute from "./Components/UnauthenticatedRoute";

// Third-Party
import React from "react";
import { Route, Switch } from "react-router-dom";

// Code
export default function Routes() {
	return (
		<Switch>
			<Route exact path="/">
				<Home />
			</Route>
			<UnauthenticatedRoute exact path="/login">
				<Login />
			</UnauthenticatedRoute>
			<UnauthenticatedRoute exact path="/signup">
				<Signup />
			</UnauthenticatedRoute>
			<AuthenticatedRoute exact path="/personen">
				<Personenverwaltung />
			</AuthenticatedRoute>
			<AuthenticatedRoute exact path="/mannschaften">
				<Mannschaftsverwaltung />
			</AuthenticatedRoute>
			<AuthenticatedRoute exact path="/turniere">
				<Turnierverwaltung />
			</AuthenticatedRoute>
			{/* Catch unmatched routes */}
			<Route>
				<NotFound />
			</Route>
		</Switch>
	);
}