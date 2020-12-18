import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Auth from "../Component/Auth";
import "./Login.css";

export default function Login() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	function validateForm() {
		return name.length > 0 && password.length > 0 && email.length > 0;
	}

	async function handleSubmit(event) {
		event.preventDefault();

		try {
			await Auth.signIn(name, email, password);
			alert("Logged in");
		} catch (e) {
			alert(e.message);
		}
	}

	return (
		<div className="Login">
			<Form onSubmit={handleSubmit}>
				<Form.Group size="lg" controlId="name">
					<Form.Label>Name</Form.Label>
					<Form.Control
						autoFocus type="text" value={name} autoComplete="username"
						onChange={(e) => setName(e.target.value)}
					/>
				</Form.Group>
				<Form.Group size="lg" controlId="email">
					<Form.Label>Email</Form.Label>
					<Form.Control
						type="email" value={email} autoComplete="email"
						onChange={(e) => setEmail(e.target.value)}
					/>
				</Form.Group>
				<Form.Group size="lg" controlId="password">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password" value={password} autoComplete="current-password"
						onChange={(e) => setPassword(e.target.value)}
					/>
				</Form.Group>
				<Button block size="lg" type="submit" disabled={!validateForm()}>
					Login
				</Button>
			</Form>
		</div>
	);
}
