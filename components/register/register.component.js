import router from '../../app.js';
import env from '../../util/env.js';
import state from '../../util/state.js';
import { ViewComponent } from '../view.component.js';

RegisterComponent.prototype = new ViewComponent('register');
function RegisterComponent() {

    let firstnameFieldElement;
    let lastnameFieldElement;
    let emailFieldElement;
    let usernameFieldElement
    let passwordFieldElement;
    let confirmPasswordFieldElement;
    let errorMessageElement;
    let registerButtonElement;

    let firstname = '';
    let lastname = '';
    let email = '';
    let username = '';
    let password = '';
    let confirmPassword = '';

    function updateFirstname(e) {
        firstname = e.target.value;
        // console.log(firstname);
    }

    function updateLastname(e) {
        lastname = e.target.value;
        // console.log(lastname);
    }

    function updateEmail(e) {
        email = e.target.value;
        // console.log(email);
    }

    function updateUsername(e) {
        username = e.target.value;
        // console.log(username);
    }

    function updatePassword(e) {
        password = e.target.value;
        // console.log(password);
        if (password === confirmPassword)
            updateErrorMessage('');
        else updateErrorMessage('Passwords must match!');
    }

    function updateConfirmPassword(e) {
        confirmPassword = e.target.value;
        // console.log(confirmPassword);
        if (password === confirmPassword)
            updateErrorMessage('');
        else updateErrorMessage('Passwords must match!');
    }

    function isUserValid() {
        if (firstname && lastname && email &&
            username && password && confirmPassword)
            return true;
        else return false;
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

    function register() {

        if (!isUserValid()) {
            updateErrorMessage('You need to fix ya credentials!')
            return;
        } else {
            updateErrorMessage();
        }

        let role = 'student';

        let newUser = {
            firstName: firstname,
            lastName: lastname,
            email: email,
            username: username,
            password: password,
            role: role
        }

        let status = 0;

        // console.log(newUser);
        // Send to RegisterServlet
        fetch(`${env.apiUrl}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser)
        })
            .then(resp => {
                status = resp.status;
                return resp.json();
            })
            .then(payload => {
                // Servlet will return 201 if transaction was acknowledge, otherwise display error
                if (status != 201) {
                    updateErrorMessage(payload.message);
                } else {
                    // console.log(payload);
                    router.navigate('/login');
                }
            })
            .catch(err => console.error(err));
    }

    this.render = function() {
        RegisterComponent.prototype.injectStylesheet();
        RegisterComponent.prototype.injectTemplate(() => {
            console.log('RegisterComponent template loaded');
            
            firstnameFieldElement = document.getElementById('register-form-firstname');
            lastnameFieldElement = document.getElementById('register-form-lastname');
            emailFieldElement = document.getElementById('register-form-email');
            usernameFieldElement = document.getElementById('register-form-username');
            passwordFieldElement = document.getElementById('register-form-password');
            confirmPasswordFieldElement = document.getElementById('register-form-confirm-password');
            registerButtonElement = document.getElementById('register-form-button');
            errorMessageElement = document.getElementById('error-msg');

            firstnameFieldElement.addEventListener('keyup', updateFirstname);
            lastnameFieldElement.addEventListener('keyup', updateLastname);
            emailFieldElement.addEventListener('keyup', updateEmail);
            usernameFieldElement.addEventListener('keyup', updateUsername);
            passwordFieldElement.addEventListener('keyup', updatePassword);
            confirmPasswordFieldElement.addEventListener('keyup', updateConfirmPassword);
            registerButtonElement.addEventListener('click', register);



        });
    }

}


export default new RegisterComponent();