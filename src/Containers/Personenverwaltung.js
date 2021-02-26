/**
 * @file Personenverwaltung.js
 * @desc Personenverwaltung-Panel
 * @author AH
 */

// First-Party
import { useFormFields } from "../libs/hooksLib";
import LoaderButton from "../Components/LoaderButton";
import LoaderField from "../Components/LoaderField";
import { onError } from "../libs/errorLib";
import { useAppContext } from "../libs/contextLib";
import "./Personenverwaltung.css";

// Third-Party
import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

// Code
export default function Personenverwaltung() {
	/** @doc https://turnierverwaltung-person-admin.herokuapp.com/swagger-ui/index.html?url=../static/core_1.0.0.yml */
	const apiURL = "https://turnierverwaltung-person-admin.herokuapp.com/api/v1/";
	const [persons, setPersons] = useState([]);
	const { isAuthenticated } = useAppContext();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [isEditing, setIEditing] = useState(false);
	const [isAdding, setAdding] = useState(false);
	const [fields, handleFieldChange] = useFormFields({
		vorname: "",
		name: "",
		geb: "",

		editingID: 0,
		editingVorname: "",
		editingName: "",
		editingGeb: "",
	});

	useEffect(() => {
		async function onLoad() {
			if (!isAuthenticated) {
				return;
			}

			setIsLoadingData(true);

			try {
				const persons = await loadPersons();

				setPersons(persons);
			} catch (e) {
				onError(e);
			}

			setIsLoadingData(false);
		}

		onLoad();
	}, [isAuthenticated, isEditing, isAdding]);

	async function loadPersons() {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "persons", {
				method: 'GET',
				headers: {
					'Authorization': "Bearer " + localStorage.getItem('session'),
				},
			}).then(data => {
				if(data.status === 200) {
					data.json().then(function (data) {
						resolve(data);
					});
				}
				else {
					reject();
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}

	async function loadPerson(id) {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "persons/" + id, {
				method: 'GET',
				headers: {
					'Authorization': "Bearer " + localStorage.getItem('session'),
				},
			}).then(data => {
				if(data.status === 200) {
					data.json().then(function (data) {
						resolve(data);
					});
				}
				else {
					reject();
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}

	function renderPersonsList(persons) {
		return (
			<>
				{persons.map(({ id, firstname, lastname, date }) => (
					<tr key={id}>
						<td>{id}</td>
						<td>{firstname}</td>
						<td>{lastname}</td>
						<td>{date}</td>
						<td>
							<Button variant="warning" block onClick={(e) => handleEdit(id, e)} disabled={localStorage.getItem('role') !== 'admin'}>Bearbeiten</Button>
						</td>
						<td>
							<Button variant="danger" block onClick={(e) => handleDelete(id, e)} disabled={localStorage.getItem('role') !== 'admin'}>Löschen</Button>
						</td>
					</tr>
				))}
			</>
		);
	}

	function renderPersons() {
		if(isLoadingData) {
			return (
				<>
					<tr>
						<td>
							<LoaderField size="lg" isLoadingData={isLoadingData} />
						</td>
						<td>
							<LoaderField size="lg" isLoadingData={isLoadingData} />
						</td>
						<td>
							<LoaderField size="lg" isLoadingData={isLoadingData} />
						</td>
						<td>
							<LoaderField size="lg" isLoadingData={isLoadingData} />
						</td>
						<td colSpan="2"/>
					</tr>
				</>
			);
		}
		else {
			return (
				<>{!isLoading && !isLoadingData && renderPersonsList(persons)}</>
			);
		}
	}

	function validateForm() {
		return fields.name.length > 0 && fields.vorname.length > 0 && fields.geb.length > 0;
	}

	function validateEditForm() {
		return fields.editingName.length > 0 && fields.editingVorname.length > 0 && fields.editingGeb.length > 0;
	}

	async function deletePerson(id) {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "persons/" + id, {
				method: 'DELETE',
				headers: {
					'Authorization': "Bearer " + localStorage.getItem('session'),
				},
			}).then(data => {
				if(data.status === 200) {
					data.json().then(function (data) {
						resolve(data);
					});
				}
				else {
					reject();
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}

	async function handleDelete(id, e) {
		e.preventDefault();
		setIsLoading(true);
		if (!isAuthenticated) {
			return;
		}

		try {
			await deletePerson(id);
			let persIndex = persons.map(function(person) { return person.id; }).indexOf(id);
			persons.splice(persIndex, 1);
		} catch (e) {
			onError(e);
		}

		setIsLoading(false);
	}

	async function handleEdit(id, e) {
		e.preventDefault();

		setIsLoading(true);
		if (!isAuthenticated) {
			return;
		}

		try {
			const person = await loadPerson(id);

			fields.editingID = id;
			fields.editingVorname = person.firstname;
			fields.editingName = person.lastname;

			let initialDate = new Date(person.date);
			fields.editingGeb = initialDate.toISOString().slice(0,10);

			setIEditing(true);

		} catch (e) {
			onError(e);
		}

		setIsLoading(false);
	}

	async function handleEditForm(e) {
		e.preventDefault();
		setIsLoading(true);
		if (!isAuthenticated) {
			return;
		}

		try {
			let initialDate = new Date(fields.editingGeb);
			let formatedDate = Date.UTC(initialDate.getUTCFullYear(), initialDate.getUTCMonth(), initialDate.getUTCDate(),
				initialDate.getUTCHours(), initialDate.getUTCMinutes(), initialDate.getUTCSeconds());

			await editPerson(formatedDate);

		} catch (e) {
			onError(e);
		}

		fields.editingID = "";
		fields.editingVorname = "";
		fields.editingName = "";

		setIsLoading(false);
		setIEditing(false);
	}

	function goBack() {
		fields.editingID = "";
		fields.editingVorname = "";
		fields.editingName = "";
		setIEditing(false);
	}

	async function editPerson(date) {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "persons/" + fields.editingID, {
				method: 'PUT',
				headers: {
					'Authorization': "Bearer " + localStorage.getItem('session'),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					"firstname": fields.editingVorname,
					"lastname": fields.editingName,
					"date": date,
				}),
			}).then(data => {
				if(data.status === 200) {
					data.json().then(function (data) {
						resolve(data);
					});
				}
				else {
					reject();
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}

	async function addPerson(date) {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "persons", {
				method: 'POST',
				headers: {
					'Authorization': "Bearer " + localStorage.getItem('session'),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					"firstname": fields.vorname,
					"lastname": fields.name,
					"date": date,
				}),
			}).then(data => {
				if(data.status === 200) {
					data.json().then(function (data) {
						resolve(data);
					});
				}
				else {
					reject();
				}
			}).catch((error) => {
				reject(error);
			});
		});
	}

	async function handleAdd(e) {
		e.preventDefault();
		setIsLoading(true);
		if (!isAuthenticated) {
			return;
		}

		try {
			setAdding(true);
			let initialDate = new Date(e.target.geb.value);
			let formatedDate = Date.UTC(initialDate.getUTCFullYear(), initialDate.getUTCMonth(), initialDate.getUTCDate(),
				initialDate.getUTCHours(), initialDate.getUTCMinutes(), initialDate.getUTCSeconds());

			await addPerson(formatedDate);

			fields.vorname = "";
			fields.name = "";
			fields.geb = "";

			setAdding(false);
		} catch (e) {
			onError(e);
		}

		setIsLoading(false);
	}

	function renderAddForm() {
		if(localStorage.getItem('role') !== 'admin') {return null}
		return(
			<Form onSubmit={handleAdd}>
				<Table hover>
					<thead>
					<tr>
						<td/>
						<td>Vorname</td>
						<td>Name</td>
						<td>Geburtstag</td>
						<td colSpan="2"/>
					</tr>
					</thead>
					<tbody>
					<tr>
						<td/>
						<td>
							<Form.Group controlId="vorname">
								<Form.Control value={fields.vorname} onChange={handleFieldChange}/>
							</Form.Group>
						</td>
						<td>
							<Form.Group controlId="name">
								<Form.Control value={fields.name} onChange={handleFieldChange}/>
							</Form.Group>
						</td>
						<td>
							<Form.Group controlId="geb">
								<Form.Control type="date" value={fields.geb} onChange={handleFieldChange}/>
							</Form.Group>
						</td>
						<td colSpan="2">
							<LoaderButton block type="submit" variant="success" isLoading={isLoading} disabled={!validateForm()}>
								Hinzufügen
							</LoaderButton>
						</td>
					</tr>
					</tbody>
				</Table>
			</Form>
		)
	}

	function renderEditingForm() {
		if(localStorage.getItem('role') !== 'admin') {return null}
		return (
			<div className="lander">
				<h1>Personenverwaltung</h1>
				<Form onSubmit={handleEditForm}>
					<Table hover>
						<thead>
						<tr>
							<td>ID</td>
							<td>Vorname</td>
							<td>Name</td>
							<td>Geburtstag</td>
							<td colSpan="2"/>
						</tr>
						</thead>
						<tbody>
						<tr>
							<td>
								<Form.Group controlId="editingID">
									<Form.Control disabled value={fields.editingID} onChange={handleFieldChange}/>
								</Form.Group>
							</td>
							<td>
								<Form.Group controlId="editingVorname">
									<Form.Control value={fields.editingVorname} onChange={handleFieldChange}/>
								</Form.Group>
							</td>
							<td>
								<Form.Group controlId="editingName">
									<Form.Control value={fields.editingName} onChange={handleFieldChange}/>
								</Form.Group>
							</td>
							<td>
								<Form.Group controlId="editingGeb">
									<Form.Control type="date" value={fields.editingGeb} onChange={handleFieldChange}/>
								</Form.Group>
							</td>
							<td>
								<LoaderButton block variant="warning" isLoading={isLoading} onClick={goBack}>
									Zurück
								</LoaderButton>
							</td>
							<td>
								<LoaderButton block type="submit" variant="success" isLoading={isLoading} disabled={!validateEditForm()}>
									Speichern
								</LoaderButton>
							</td>
						</tr>
						</tbody>
					</Table>
				</Form>
			</div>
		);
	}

	function renderHomeForm() {
		return (
			<div className="lander">
				<h1>Personenverwaltung</h1>
				<Table hover>
					<thead>
					<tr>
						<td>ID</td>
						<td>Vorname</td>
						<td>Name</td>
						<td>Geburtstag</td>
						<td colSpan="2"/>
					</tr>
					</thead>
					<tbody>
						{renderPersons()}
					</tbody>
				</Table>
				{renderAddForm()}
			</div>
		);
	}

	return (
		<div className="Personenverwaltung">
			{isAuthenticated ? isEditing ? renderEditingForm() : renderHomeForm() : null}
		</div>
	);
}
