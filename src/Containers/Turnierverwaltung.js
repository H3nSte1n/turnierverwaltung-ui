/**
 * @file Turnierverwaltung.js
 * @desc Turnierverwaltung-Panel
 * @author AH
 */

// First-Party
import { useFormFields } from "../libs/hooksLib";
import LoaderButton from "../Components/LoaderButton";
import LoaderField from "../Components/LoaderField";
import { onError } from "../libs/errorLib";
import { useAppContext } from "../libs/contextLib";
import "./Turnierverwaltung.css";

// Third-Party
import React, { useState,  useEffect } from "react";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

// Code
export default function Turnierverwaltung() {
	/** @doc https://tournament-management-service.herokuapp.com/swagger-ui/index.html?url=../static/core_1.0.0.yml */
	const apiURL = "https://tournament-management-service.herokuapp.com/api/v1/";
	/** @doc https://teams-management-system.herokuapp.com/swagger-ui/index.html?url=../static/core_1.0.0.yml */
	const teamsApiURL = "https://teams-management-system.herokuapp.com/api/v1/";
	const [tournaments, setTournaments] = useState([]);
	const { isAuthenticated } = useAppContext();
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [isEditing, setIEditing] = useState(false);
	const [isAdding, setAdding] = useState(false);
	const [fields, handleFieldChange] = useFormFields({
		name: "",

		editingID: 0,
		editingName: "",
		editingTeams: [],
	});

	useEffect(() => {
		async function onLoad() {
			if (!isAuthenticated) {
				return;
			}

			setIsLoadingData(true);

			try {
				const tournaments = await loadTournaments();
				const teams = await loadTeams();

				const teamsMap = {};
				teams.forEach(function(team) {teamsMap[team.id] = team;});

				tournaments.map(function (tournament) {
					if(tournament.teamList.length === 0) {
						return tournament;
					}
					else {
						tournament.teamList = tournament.teamList.map(function (team) {
							if(typeof teamsMap[team] === 'undefined') {
								team = {id: team, name: "[FEHLER] Undefiniertes Team"};
							}
							else {
								team = teamsMap[team];
							}
							return team;
						});
					}

					return tournament;
				});

				setTournaments(tournaments);
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

	function goBack() {
		fields.editingID = "";
		fields.editingName = "";
		fields.editingTeams = "";
		setIEditing(false);
	}

	async function loadTeams() {
		return new Promise((resolve, reject) => {
			fetch(teamsApiURL + "teams", {
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

	async function loadTournaments() {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "tournaments", {
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

	async function loadTournament(id) {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "tournaments/" + id, {
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

	async function deleteTournament(id) {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "tournaments/" + id, {
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
			await deleteTournament(id);
			let persIndex = tournaments.map(function(tournament) { return tournament.id; }).indexOf(id);
			tournaments.splice(persIndex, 1);
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
			const tournament = await loadTournament(id);
			const teams = await loadTeams();

			let teamInTournament = {};
			let teamsMap = [];

			teams.forEach(function(team) {teamsMap[team.id] = team;});

			if(tournament.teamList.length === 0) {}
			else {
				tournament.teamList = tournament.teamList.map(function (team) {
					if(typeof teamsMap[team] === 'undefined') {
						teamInTournament = {id: team, name: "[FEHLER] Undefiniertes Team"};
					}
					else {
						teamInTournament = teamsMap[team];
						teamsMap.splice(team, 1);
					}

					return teamInTournament;
				});
			}

			for (let i = 0; i < tournament.teamList.length; i++) {
				if(tournament.teamList[i].name === "[FEHLER] Undefiniertes Team") {
					delete tournament.teamList[i];
				}
			}

			fields.editingID = id;
			fields.editingName = tournament.name;

			let checkedTeams;
			let uncheckedTeams;

			checkedTeams = tournament.teamList.map(function(team) {
				team.selected = true;
				return team;
			});

			uncheckedTeams = teamsMap.map(function(team) {
				team.selected = false;
				return team;
			});

			fields.editingTeams = {...fields.editingTeams, ...checkedTeams};
			fields.editingTeams = {...fields.editingTeams, ...uncheckedTeams};

			fields.editingTeams = Object.values(fields.editingTeams);

			setIEditing(true);

		} catch (e) {
			onError(e);
		}

		setIsLoading(false);
	}

	function renderTournamentsList(tournaments) {
		return (
			<>
				{tournaments.map(({ id, name, teamList }) => (
					<tr key={id}>
						<td>{id}</td>
						<td>{name}</td>
						<td>
							<Form.Group>
								<Form.Control as="select">
									{teamList.map(( team ) => (
										<option key={team.id}>[{team.id}] - {team.name}</option>
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

	function renderTournaments() {
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
				<>{!isLoading && !isLoadingData && renderTournamentsList(tournaments)}</>
			);
		}
	}

	async function addTournament() {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "tournaments", {
				method: 'POST',
				headers: {
					'Authorization': "Bearer " + localStorage.getItem('session'),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					"name": fields.name,
					"teamList": [],
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

	async function editTournament(teamData) {
		return new Promise((resolve, reject) => {
			fetch(apiURL + "tournaments/" + fields.editingID, {
				method: 'PUT',
				headers: {
					'Authorization': "Bearer " + localStorage.getItem('session'),
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					"name": fields.editingName,
					"teamList" : teamData,
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
			await addTournament();

			fields.name = "";

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

	async function handleEditForm(e) {
		e.preventDefault();
		setIsLoading(true);
		if (!isAuthenticated) {
			return;
		}

		try {
			let selectedTeams = e.target.selectedEditingTeams.selectedOptions;

			let teamData = [];

			for(let selectedTeam of selectedTeams) {
				if(selectedTeam.selected) {
					teamData.push(parseInt(selectedTeam.value));
				}
			}

			await editTournament(teamData);
		} catch (e) {
			onError(e);
		}

		fields.editingID = "";
		fields.editingName = "";
		fields.editingTeams = [];

		setIsLoading(false);
		setIEditing(false);
	}

	function renderEditingForm() {
		if(localStorage.getItem('role') !== 'admin') {return null}
		return (
			<div className="lander">
				<h1>Turnierverwaltung</h1>
				<Form onSubmit={handleEditForm}>
					<Table hover>
						<thead>
						<tr>
							<td>ID</td>
							<td>Name</td>
							<td>Mannschaften</td>
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
								<Form.Group controlId="selectedEditingTeams">
									<Form.Control as="select" multiple={true}>
										{fields.editingTeams.map(( team ) => (
											<option selected={team.selected} key={team.id} value={team.id}>[{team.id}] - {team.name}</option>
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
				<h1>Turnierverwaltung</h1>
				<Table hover>
					<thead>
					<tr>
						<td>ID</td>
						<td>Name</td>
						<td>Teams</td>
						<td colSpan="2"/>
					</tr>
					</thead>
					<tbody>
					{renderTournaments()}
					</tbody>
				</Table>
				{renderAddForm()}
			</div>
		);
	}

	return (
		<div className="Turnierverwaltung">
			{isAuthenticated ? isEditing ? renderEditingForm() : renderHomeForm() : null}
		</div>
	);
}
