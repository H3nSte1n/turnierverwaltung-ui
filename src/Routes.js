import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./Containers/Home";
import NotFound from "./Containers/NotFound";
import Login from "./Containers/Login";
import Signup from "./Containers/Signup";
import AuthenticatedRoute from "./Components/AuthenticatedRoute";
import UnauthenticatedRoute from "./Components/UnauthenticatedRoute";

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
			{/* Catch unmatched routes */}
			<Route>
				<NotFound />
			</Route>
		</Switch>
	);
}