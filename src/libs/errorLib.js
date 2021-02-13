/**
 * @file errorLib.js
 * @desc Handler for Error-Messages
 * @author AH
 */

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