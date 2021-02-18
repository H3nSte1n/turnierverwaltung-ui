/**
 * @file AuthenticatedRoute.js
 * @desc Component for handeling Routes of authenticated users
 * @author AH
 */

// First-Party
import { useAppContext } from "../libs/contextLib";

// Third-Party
import React from "react";
import { Route, Redirect, useLocation } from "react-router-dom";

// Code
export default function AuthenticatedRoute({ children, ...rest }) {
	const { pathname, search } = useLocation();
	const { isAuthenticated } = useAppContext();
	return (
		<Route {...rest}>
			{isAuthenticated ? (
				children
			) : (
				<Redirect to={
					`/login?redirect=${pathname}${search}`
				} />
			)}
		</Route>
	);
}