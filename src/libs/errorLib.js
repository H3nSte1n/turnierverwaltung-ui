/**
 * @file errorLib.js
 * @desc Handler for Error-Messages
 * @author AH
 *
 * TODO: Make a nice looking Error Message instead of a hard alert
 */

// Code
export function onError(error) {
	if(error) {
		let message = error.toString();

		// Auth errors
		if (!(error instanceof Error) && error.message) {
			message = error.message;
		}

		alert(message);
	}
	else {
		console.log("[Mannschaftsverwaltung] - Undefined Error")
	}
}