import React, { useState } from "react";
import Auth from "../Components/Auth";
import Form from "react-bootstrap/Form";
import { useHistory } from "react-router-dom";
import LoaderButton from "../Components/LoaderButton";
import { useAppContext } from "../libs/contextLib";
import { useFormFields } from "../libs/hooksLib";
import { onError } from "../libs/errorLib";
import "./Login.css";

export default function Login() {
	const history = useHistory();
	const { userHasAuthenticated } = useAppContext();
	const [isLoading, setIsLoading] = useState(false);
	const [fields, handleFieldChange] = useFormFields({ // TODO: Enable E-Mail again
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
			history.push("/");
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
					<Form.Control autoFocus type="name" value={fields.name} onChange={handleFieldChange}/>
				</Form.Group>
				<Form.Group size="lg" controlId="password">
					<Form.Label>Password</Form.Label>
					<Form.Control type="password" value={fields.password} onChange={handleFieldChange}/>
				</Form.Group>
				<LoaderButton block size="lg" type="submit" isLoading={isLoading} disabled={!validateForm()}>
					Login
				</LoaderButton>
			</Form>
		</div>
	);
}
