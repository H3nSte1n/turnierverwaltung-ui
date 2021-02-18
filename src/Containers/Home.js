/**
 * @file Home.js
 * @desc Home-Panel
 * @author AH
 */

// First-Party
import "./Home.css";

// Third-Party
import React from "react";

// Code
export default function Home() {
	return (
		<div className="Home">
			<div className="lander">
				<h1>Turnierverwaltung</h1>
				<p className="text-muted">Eine Turnierverwaltung</p>
			</div>
		</div>
	);
}