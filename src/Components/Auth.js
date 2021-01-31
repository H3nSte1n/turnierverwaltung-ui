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

	/**
	 * @doc https://turnierverwaltung-auth.herokuapp.com/swagger-ui/index.html?url=../static/core_1.0.0.yml
	 * @type {string}
	 */
	static authAPIUrl = "https://cors-anywhere.herokuapp.com/https://turnierverwaltung-auth.herokuapp.com/api/v1/";

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
					data.text().then(function(data) {
						localStorage.setItem('session', data)
					});
					localStorage.setItem('username', authDetails.name)
					resolve(data);
				}
				else {
					return this.rejectAuthError(this.AuthErrorTypes.SignInError);
				}
			}).catch((error) => {
				return this.rejectAuthError(this.AuthErrorTypes.SignInError);
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

		if (data && typeof data === 'object') {
			username = data['username'];
			password = data['password'];
			email = data['email'];
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
					"role": "user", // admin|user
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
				return this.rejectAuthError(this.AuthErrorTypes.SignUpError);
			});
		});
	}

	/**
	 *
	 * @returns {Promise<void>}
	 */
	static async signOut() {
		try {
			localStorage.removeItem('username');
			localStorage.removeItem('session');
		} catch (e) { }
	}

	/**
	 *
	 * @returns {Promise<void>}
	 */
	static async currentSession() {
		console.log("User: " + localStorage.getItem('username'));
		console.log("Session: " + localStorage.getItem('session'));
		return new Promise((resolve, reject) => {
			if (!localStorage.getItem('username') || !localStorage.getItem('session')) {
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