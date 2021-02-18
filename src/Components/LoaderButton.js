/**
 * @file LoaderButton.js
 * @desc Styled Button Component for Loading
 * @author AH
 */

// First-Party
import "./LoaderButton.css";

// Third-Party
import React from "react";
import Button from "react-bootstrap/Button";
import { BsArrowRepeat } from "react-icons/bs";

// Code
export default function LoaderButton({
	isLoading, className = "", disabled = false, ...props
 }) {
	return (
		<Button disabled={disabled || isLoading} className={`LoaderButton ${className}`}{...props}>
			{isLoading && <BsArrowRepeat className="spinning" />}
			{props.children}
		</Button>
	);
}