/**
 * @file LoaderField.js
 * @desc Styled Field Component for Loading
 * @author AH
 */

// First-Party
import "./LoaderField.css";

// Third-Party
import React from "react";
import { BsArrowRepeat } from "react-icons/bs";

// Code
export default function LoaderField({isLoadingData, className = "", ...props}) {
	return (
		<div className={`LoaderField ${className}`}{...props}>
			{isLoadingData && <BsArrowRepeat className="spinning" />}
			{props.children}
		</div>
	);
}