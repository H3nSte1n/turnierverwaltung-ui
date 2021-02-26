/**
 * @file Signup.js
 * @desc Signup-Panel
 * @author AH
 */

// First-Party
import LoaderButton from "../Components/LoaderButton";
import { useAppContext } from "../libs/contextLib";
import { useFormFields } from "../libs/hooksLib";
import { onError } from "../libs/errorLib";
import "./Signup.css";

// Third-Party
import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Auth from "../Components/Auth";
import { useHistory } from "react-router-dom";

// Code
export default function Signup() {
	const [fields, handleFieldChange] = useFormFields({
		user: "",
		password: "",
		email: "",
		confirmPassword: "",
		role: "user",
	});
	const history = useHistory();
	const [newUser, setNewUser] = useState(null);
	const { userHasAuthenticated } = useAppContext();
	const [isLoading, setIsLoading] = useState(false);

	function validateForm() {
		return (
			fields.user.length > 0 &&
			fields.password.length > 0 &&
			fields.email.length > 0 &&
			fields.role.length > 0 &&
			fields.password === fields.confirmPassword
		);
	}

	async function handleSubmit(event) {
		event.preventDefault();

		setIsLoading(true);

		try {
			const newUser = await Auth.signUp({
				username: fields.user,
				password: fields.password,
				email: fields.email,
				role: fields.role,
			});
			setNewUser(newUser);

			await Auth.signIn(fields.user, fields.password);
			userHasAuthenticated(true);
			setIsLoading(false);

			history.push("/");
		} catch (e) {
			onError(e);
			setIsLoading(false);
		}
	}

	function renderForm() {
		return (
			<Form onSubmit={handleSubmit}>
				<Form.Group controlId="user" size="lg">
					<Form.Label>User</Form.Label>
					<Form.Control autoFocus type="user" value={fields.user} onChange={handleFieldChange} autoComplete="username"/>
				</Form.Group>
				<Form.Group controlId="email" size="lg">
					<Form.Label>E-Mail-Address</Form.Label>
					<Form.Control type="email" value={fields.email} onChange={handleFieldChange} autoComplete="email"/>
				</Form.Group>
				<Form.Group controlId="role" size="lg">
					<Form.Label>Benutzergruppe</Form.Label>
					<Form.Control as="select" value={fields.role} onChange={handleFieldChange} autoComplete="off">
						<option value="user">Benutzer</option>
						<option value="admin">Admin</option>
					</Form.Control>
				</Form.Group>
				<Form.Group controlId="password" size="lg">
					<Form.Label>Password</Form.Label>
					<Form.Control type="password" value={fields.password} onChange={handleFieldChange} autoComplete="new-password"/>
				</Form.Group>
				<Form.Group controlId="confirmPassword" size="lg">
					<Form.Label>Confirm Password</Form.Label>
					<Form.Control type="password" onChange={handleFieldChange} value={fields.confirmPassword} autoComplete="new-password"/>
				</Form.Group>
				<LoaderButton block size="lg" type="submit" variant="success" isLoading={isLoading} disabled={!validateForm()}>
					Signup
				</LoaderButton>
			</Form>
		);
	}

	return (
		<div className="Signup">
			{newUser === null ? renderForm() : history.push("/")}
		</div>
	);
}