import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Auth from "../Components/Auth";
import { useHistory } from "react-router-dom";
import LoaderButton from "../Components/LoaderButton";
import { useAppContext } from "../libs/contextLib";
import { useFormFields } from "../libs/hooksLib";
import { onError } from "../libs/errorLib";
import "./Signup.css";

export default function Signup() {
	const [fields, handleFieldChange] = useFormFields({
		user: "",
		password: "",
		email: "",
		confirmPassword: "",
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
					<Form.Control autoFocus type="user" value={fields.user} onChange={handleFieldChange}/>
				</Form.Group>
				<Form.Group controlId="email" size="lg">
					<Form.Label>E-Mail-Address</Form.Label>
					<Form.Control type="email" value={fields.email} onChange={handleFieldChange}/>
				</Form.Group>
				<Form.Group controlId="password" size="lg">
					<Form.Label>Password</Form.Label>
					<Form.Control type="password" value={fields.password} onChange={handleFieldChange}/>
				</Form.Group>
				<Form.Group controlId="confirmPassword" size="lg">
					<Form.Label>Confirm Password</Form.Label>
					<Form.Control type="password" onChange={handleFieldChange} value={fields.confirmPassword}/>
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