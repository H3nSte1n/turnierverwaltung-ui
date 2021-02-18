/**
 * @file hooksLib.js
 * @desc Used, to make the usage of States easier
 * @author AH
 */

// Third-Party
import { useState } from "react";

// Code
export function useFormFields(initialState) {
	const [fields, setValues] = useState(initialState);

	return [
		fields,
		function(event) {
			setValues({
				...fields,
				[event.target.id]: event.target.value
			});
		}
	];
}