/**
 * @file Mannschaftsverwaltung.js
 * @desc Mannschaftsverwaltung-Panel
 * @author AH
 */

// First-Party
import { useFormFields } from "../libs/hooksLib";
import LoaderButton from "../Components/LoaderButton";
import LoaderField from "../Components/LoaderField";
import { onError } from "../libs/errorLib";
import { useAppContext } from "../libs/contextLib";
import "./Mannschaftsverwaltung.css";

// Third-Party
import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

// Code
export default function Mannschaftsverwaltung() {
	/** @doc https://teams-management-system.herokuapp.com/swagger-ui/index.html?url=../static/core_1.0.0.yml */
	const apiURL = "https://teams-management-system.herokuapp.com/api/v1/";
	/** @doc https://turnierverwaltung-person-admin.herokuapp.com/swagger-ui/index.html?url=../static/core_1.0.0.yml */
	const personsApiURL = "https://turnierverwaltung-person-admin.herokuapp.com/api/v1/";
	const [teams, setTeams] = useState([]);
	const { isAuthenticated } = useAppContext();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [isEditing, setIEditing] = useState(false);
	const [isAdding, setAdding] = useState(false);
	const [fields, handleFieldChange] = useFormFields({
		name: "",

		editingID: 0,
		editingName: "",
		editingPersons: [],
	});

	useEffect(() => {
		async function onLoad() {
			if (!isAuthenticated) {
				return;
			}

			setIsLoadingData(true);

			try {
				const teams = await loadTeams();
				const persons = await loadPersons();

				const personsMap = {};
				persons.forEach(function(person) {personsMap[person.id] = person;});

				teams.map(function (team) {
					if(team.personList.length === 0) {
						return team;
					}
					else {
						team.personList = team.personList.map(function (person) {
							if(typeof personsMap[person] === 'undefined') {
								person = {id: person, firstname: "[FEHLER]", lastname: "Undefinierte Person", date: null};
							}
							else {
								person = personsMap[person];
							}
							return person;
						});
					}

					return team;
				});

				setTeams(teams);
			} catch (e) {
				onError(e);
			}

			setIsLoadingData(false);
		}

		onLoad();
	}, [isAuthenticated, isEditing, isAdding]);

	function validateForm() {
		return fields.name.length > 0;
	}

	function validateEditForm() {
		return fields.editingName.length > 0;
	}

	async function loadPersons() {
		return new Promise((resolve, reject) => {
			fetch(personsApiURL + "persons", {
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

	async function loadTeams() {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "teams", {
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

	async function loadTeam(id) {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "teams/" + id, {
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

	async function handleEdit(id, e) {
		e.preventDefault();

		setIsLoading(true);
		if (!isAuthenticated) {
			return;
		}

		try {
			const team = await loadTeam(id);
			const persons = await loadPersons();

			let personInTeam = {};
			let personsMap = [];

			persons.forEach(function(person) {personsMap[person.id] = person;});

			if(team.personList.length === 0) {}
			else {
				team.personList = team.personList.map(function (person) {
					if(typeof personsMap[person] === 'undefined') {
						personInTeam = {id: person, firstname: "[FEHLER]", lastname: "Undefinierte Person", date: null};
					}
					else {
						personInTeam = personsMap[person];
						personsMap.splice(person, 1);
					}

					return personInTeam;
				});
			}

			for (let i = 0; i < team.personList.length; i++) {
				if(team.personList[i].firstname === "[FEHLER]") {
					delete team.personList[i];
				}
			}

			fields.editingID = id;
			fields.editingName = team.name;

			let checkedPersons;
			let uncheckedPersons;

			checkedPersons = team.personList.map(function(person) {
				person.selected = true;
				return person;
			});

			uncheckedPersons = personsMap.map(function(person) {
				person.selected = false;
				return person;
			});

			fields.editingPersons = {...fields.editingPersons, ...checkedPersons};
			fields.editingPersons = {...fields.editingPersons, ...uncheckedPersons};

			fields.editingPersons = Object.values(fields.editingPersons);

			setIEditing(true);

		} catch (e) {
			onError(e);
		}

		setIsLoading(false);
	}

	function goBack() {
		fields.editingID = "";
		fields.editingName = "";
		fields.editingPersons = [];
		setIEditing(false);
	}

	async function deleteTeam(id) {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "teams/" + id, {
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
			await deleteTeam(id);
			let teamIndex = teams.map(function(person) { return person.id; }).indexOf(id);
			teams.splice(teamIndex, 1);
		} catch (e) {
			onError(e);
		}

		setIsLoading(false);
	}

	async function addTeam() {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "teams", {
				method: 'POST',
				headers: {
					'Authorization': "Bearer " + localStorage.getItem('session'),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					"name": fields.name,
					"personList": [],
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
			await addTeam();

			fields.name = "";

			setAdding(false);
		} catch (e) {
			onError(e);
		}

		setIsLoading(false);
	}

	function renderTeamsList(teams) {
		return (
			<>
				{teams.map(({ id, name, personList }) => (
					<tr key={id}>
						<td>{id}</td>
						<td>{name}</td>
						<td>
							<Form.Group>
								<Form.Control as="select">
									{personList.map(( person ) => (
										<option key={person.id}>[{person.id}] - {person.firstname}, {person.lastname}</option>
									))}
								</Form.Control>
							</Form.Group>
						</td>
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

	function renderTeams() {
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
						<td colSpan="2"/>
					</tr>
				</>
			);
		}
		else {
			return (
				<>{!isLoading && !isLoadingData && renderTeamsList(teams)}</>
			);
		}
	}

	function renderAddForm() {
		if(localStorage.getItem('role') !== 'admin') {return null}
		return(
			<Form onSubmit={handleAdd}>
				<Table hover>
					<thead>
					<tr>
						<td/>
						<td>Name</td>
						<td colSpan="3"/>
					</tr>
					</thead>
					<tbody>
					<tr>
						<td/>
						<td>
							<Form.Group controlId="name">
								<Form.Control value={fields.name} onChange={handleFieldChange}/>
							</Form.Group>
						</td>
						<td colSpan="3">
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

	async function editTeam(personData) {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "teams/" + fields.editingID, {
				method: 'PUT',
				headers: {
					'Authorization': "Bearer " + localStorage.getItem('session'),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					"name": fields.editingName,
					"personList" : personData,
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

	async function handleEditForm(e) {
		e.preventDefault();
		setIsLoading(true);
		if (!isAuthenticated) {
			return;
		}

		try {
			let selectedPersons = e.target.selectedEditingPersons.selectedOptions;

			let personData = [];

			for(let selectedPerson of selectedPersons) {
				if(selectedPerson.selected) {
					personData.push(parseInt(selectedPerson.value));
				}
			}

			await editTeam(personData);
		} catch (e) {
			onError(e);
		}

		fields.editingID = "";
		fields.editingName = "";
		fields.editingPersons = [];

		setIsLoading(false);
		setIEditing(false);
	}

	function renderEditingForm() {
		if(localStorage.getItem('role') !== 'admin') {return null}
		return (
			<div className="lander">
				<h1>Mannschaftsverwaltung</h1>
				<Form onSubmit={handleEditForm}>
					<Table hover>
						<thead>
						<tr>
							<td>ID</td>
							<td>Name</td>
							<td>Personen</td>
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
								<Form.Group controlId="editingName">
									<Form.Control value={fields.editingName} onChange={handleFieldChange}/>
								</Form.Group>
							</td>
							<td>
								<Form.Group controlId="selectedEditingPersons">
									<Form.Control as="select" multiple={true}>
										{fields.editingPersons.map(( person ) => (
											<option selected={person.selected} key={person.id} value={person.id}>[{person.id}] - {person.firstname}, {person.lastname}</option>
										))}
									</Form.Control>
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
				<h1>Mannschaftsverwaltung</h1>
				<Table hover>
					<thead>
					<tr>
						<td>ID</td>
						<td>Name</td>
						<td>Personen</td>
						<td colSpan="2"/>
					</tr>
					</thead>
					<tbody>
					{renderTeams()}
					</tbody>
				</Table>
				{renderAddForm()}
			</div>
		);
	}

	return (
		<div className="Mannschaftsverwaltung">
			{isAuthenticated ? isEditing ? renderEditingForm() : renderHomeForm() : null}
		</div>
	);
}
