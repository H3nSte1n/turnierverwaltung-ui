/**
 * @file Login.js
 * @desc Login-Panel
 * @author AH
 */

// First-Party
import Auth from "../Components/Auth";
import LoaderButton from "../Components/LoaderButton";
import { useAppContext } from "../libs/contextLib";
import { useFormFields } from "../libs/hooksLib";
import { onError } from "../libs/errorLib";
import "./Login.css";

// Third-Party
import React, { useState } from "react";
import Form from "react-bootstrap/Form";

// Code
export default function Login() {
	const { userHasAuthenticated } = useAppContext();
	const [isLoading, setIsLoading] = useState(false);
	const [fields, handleFieldChange] = useFormFields({
		name: "",
		password: "",
	});

	function validateForm() {
		return fields.name.length > 0 && fields.password.length > 0;
	}

	async function handleSubmit(event) {
		event.preventDefault();

		setIsLoading(true);

		try {
			await Auth.signIn(fields.name, fields.password);
			userHasAuthenticated(true);
		} catch (e) {
			onError(e);
			setIsLoading(false);
		}
	}

	return (
		<div className="Login">
			<Form onSubmit={handleSubmit}>
				<Form.Group size="lg" controlId="name">
					<Form.Label>Name</Form.Label>
					<Form.Control autoFocus type="name" value={fields.name} onChange={handleFieldChange} autoComplete="username"/>
				</Form.Group>
				<Form.Group size="lg" controlId="password">
					<Form.Label>Password</Form.Label>
					<Form.Control type="password" value={fields.password} onChange={handleFieldChange} autoComplete="current-password"/>
				</Form.Group>
				<LoaderButton block size="lg" type="submit" isLoading={isLoading} disabled={!validateForm()}>
					Login
				</LoaderButton>
			</Form>
		</div>
	);
}
