import { ViewComponent } from '../view.component.js';
import env from '../../util/env.js';
import state from '../../util/state.js';
import router from '../../app.js';

LoginComponent.prototype = new ViewComponent('login');
function LoginComponent() {

    let usernameFieldElement;
    let passwordFieldElement;
    let loginButtonElement;
    let rememberMeCheckbox;
    let errorMessageElement;

    let username = '';
    let password = '';

    function updateUsername(e) {
        if(e.keyCode === 13) {
            loginButtonElement.click();
        } else {
            username = e.target.value;
        }
    }

    function updatePassword(e) {
        if(e.keyCode === 13) {
            loginButtonElement.click();
        } else {
            password = e.target.value;
        }
    }

    function updateErrorMessage(errorMessage) {
        if (errorMessage) {
            errorMessageElement.removeAttribute('hidden');
            errorMessageElement.innerText = errorMessage;
        } else {
            errorMessageElement.setAttribute('hidden', 'true');
            errorMessageElement.innerText = '';
        }
    }

    function navigateToRegisterView() {
        router.navigate('/register');
    }

    function login() {

        if (!username || !password) {
            updateErrorMessage('You need to provide a username and a password!');
            return;
        } else {
            updateErrorMessage('');
        }

        passwordFieldElement.value = '';

        let credentials = {
            username: username,
            password: password
        };

        let status = 0;
        let token = 0;

        // Send to LoginServlet
        fetch(`${env.apiUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })
            .then(resp => {
                // Get JWT
                token = resp.headers.get('Authorization');
                state.token = token;
                sessionStorage.setItem('token', JSON.stringify(token));
                if(rememberMeCheckbox.checked) {
                    localStorage.setItem('token', JSON.stringify(token));
                }
                status = resp.status;
                return resp.json();
            })
            .then(payload => {
                if (status === 401) {
                    updateErrorMessage(payload.message);
                } else {
                    state.authUser = payload;
                    sessionStorage.setItem('user', JSON.stringify(payload));
                    if(rememberMeCheckbox.checked) {
                        localStorage.setItem('user', JSON.stringify(payload));
                    }
                    router.navigate('/dashboard');
                }
            })
            .catch(err => console.error(err));


            document.getElementById('logout').removeAttribute('hidden');
    }

    this.render = function() {
        LoginComponent.prototype.injectStylesheet();
        LoginComponent.prototype.injectTemplate(() => {

            usernameFieldElement = document.getElementById('login-form-username');
            passwordFieldElement = document.getElementById('login-form-password');
            loginButtonElement = document.getElementById('login-form-button');
            errorMessageElement = document.getElementById('error-msg');
            rememberMeCheckbox = document.getElementById('remember-me-checkbox');

            usernameFieldElement.addEventListener('keyup', updateUsername);
            passwordFieldElement.addEventListener('keyup', updatePassword);
            loginButtonElement.addEventListener('click', login);

            document.getElementById('nav-to-register-footer').addEventListener('click', navigateToRegisterView);


            // Append path to the end of the web address
            // window.history.pushState('login', 'Login', '/login');

        });
    }

}

export default new LoginComponent();