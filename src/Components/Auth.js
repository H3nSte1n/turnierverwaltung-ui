/**
 * @file Auth.js
 * @desc Class for handeling authentication things
 * @author CJ & AH
 */

export default class Auth {

	static AuthErrorTypes = {
		EmptyUsername : 'emptyUsername',
		InvalidUsername : 'invalidUsername',
		EmptyPassword : 'emptyPassword',
		EmptyCode : 'emptyCode',
		SignUpError : 'signUpError',
		SignInError : 'signInError',
		Default : 'default',
	}

	/** @doc https://turnierverwaltung-auth.herokuapp.com/swagger-ui/index.html?url=../static/core_1.0.0.yml */
	static authAPIUrl = "https://turnierverwaltung-auth.herokuapp.com/api/v1/";

	/**
	 *
	 * @param usernameOrSignInOpts
	 * @param pass
	 * @returns {Promise<void>}
	 */
	static async signIn(usernameOrSignInOpts, pass) {
		let username = usernameOrSignInOpts;
		let password = pass;

		if (!username) {
			return this.rejectAuthError(this.AuthErrorTypes.EmptyUsername);
		}
		if(!password) {
			return this.rejectAuthError(this.AuthErrorTypes.EmptyPassword);
		}

		let authDetails = {
			name: username,
			password: password,
		};

		return this.signInWithPassword(authDetails);
	}

	/**
	 *
	 * @param authDetails
	 * @returns {null|Promise<unknown>|*}
	 */
	static signInWithPassword(authDetails) {
		if (this.pendingSignIn) {
			throw new Error('Pending sign-in attempt already in progress');
		}

		this.pendingSignIn = new Promise((resolve, reject) => {
			fetch(this.authAPIUrl + "sign-in", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(authDetails),
			}).then(data => {
				if(data.status === 200) {
					data.json().then(function(data) {
						localStorage.setItem('session', data.token);
						localStorage.setItem('role', data.role);
					});
					localStorage.setItem('username', authDetails.name)
					resolve(data);
				}
				else {
					return this.rejectAuthError(this.AuthErrorTypes.SignInError);
				}
			}).catch((error) => {
				reject(error)
			});
		});

		return this.pendingSignIn;
	}

	/**
	 *
	 * @param data
	 * @returns {Promise<void>}
	 */
	static async signUp(data) {
		let username = null;
		let password = null;
		let email = null;
		let role = "user";

		if (data && typeof data === 'object') {
			username = data['username'];
			password = data['password'];
			email = data['email'];
			role = data['role'];
		} else {
			return this.rejectAuthError(this.AuthErrorTypes.SignUpError);
		}

		if (!username) {
			return this.rejectAuthError(this.AuthErrorTypes.EmptyUsername);
		}
		if (!password) {
			return this.rejectAuthError(this.AuthErrorTypes.EmptyPassword);
		}

		return new Promise((resolve, reject) => {
			fetch(this.authAPIUrl + "sign-up", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					"name": username,
					"password": password,
					"email": email,
					"role": role,
				}),
			}).then(data => {
				resolve(data);
				if(data.status === 200) {
					resolve(data);
				}
				else {
					return this.rejectAuthError(this.AuthErrorTypes.SignUpError);
				}
			}).catch((error) => {
				reject(error)
			});
		});
	}

	/**
	 *
	 * @returns {Promise<void>}
	 */
	static async signOut() {
		try {
			delete this.pendingSignIn;

			localStorage.removeItem('username');
			localStorage.removeItem('session');
			localStorage.removeItem('role');
		} catch (e) { }
	}

	/**
	 *
	 * @returns {Promise<void>}
	 */
	static async currentSession() {
		return new Promise((resolve, reject) => {
			if (!localStorage.getItem('username') || !localStorage.getItem('session') || !localStorage.getItem('role')) {
				return reject();
			} else {
				return resolve();
			}
		});
	}

	/**
	 *
	 * @param type
	 * @returns {Promise<never>}
	 */
	static rejectAuthError(type) {
		return Promise.reject(type);
	}
}