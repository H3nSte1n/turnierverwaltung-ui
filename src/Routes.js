import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./Containers/Home";
import NotFound from "./Containers/NotFound";
import Login from "./Containers/Login";
import Signup from "./Containers/Signup";

export default function Routes() {
	return (
		<Switch>
			<Route exact path="/">
				<Home />
			</Route>
			<Route exact path="/login">
				<Login />
			</Route>
			<Route exact path="/signup">
				<Signup />
			</Route>
			{/* Catch unmatched routes */}
			<Route>
				<NotFound />
			</Route>
		</Switch>
	);
}