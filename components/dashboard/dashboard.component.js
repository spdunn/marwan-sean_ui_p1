import { ViewComponent } from '../view.component.js';
import env from '../../util/env.js';
import state from '../../util/state.js';
import router from '../../app.js';

DashboardComponent.prototype = new ViewComponent('dashboard');
function DashboardComponent() {

    let welcomeUserElement;
    let usernameElement;
    let nameElement;
    let emailElement;
    let scheduleElement;

    let firstName = '';
    let lastName = '';
    let email = '';
    let schedule = {};

    this.render = function() {

        if (!state.authUser) {
            router.navigate('/login');
            return;
        }

        let currentUsername = state.authUser.username;

        DashboardComponent.prototype.injectStylesheet();
        DashboardComponent.prototype.injectTemplate(() => {            

            welcomeUserElement = document.getElementById('welcome-user');
            usernameElement = document.getElementById('username-container');
            nameElement = document.getElementById('name-container');
            emailElement = document.getElementById('email-container');
            scheduleElement = document.getElementById('schedule-container');

            welcomeUserElement.innerText += ' ' + currentUsername + '!';


            // Send to UserServlet
            fetch(`${env.apiUrl}/users/${state.authUser.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${state.token}`
                }
            })
                .then(resp => {
                    status = resp.status;
                    return resp.json();
                })
                .then(payload => {
                    if (status === 401) {
                        updateErrorMessage(payload.message);
                    } else {
                        firstName = payload.firstName;
                        console.log(firstName);
                        lastName = payload.lastName;
                        console.log(lastName);
                        email = payload.email;
                        console.log(email);
                        // schedule = payload.schedule;
                        // console.log(schedule);
                        nameElement.innerText = firstName + lastName;
                        emailElement.innerText = email;
                        // scheduleElement.innerText = schedule;
                        console.log(state);
                        
                    }
                })
                .catch(err => console.error(err));

            

            // Append path to end of web address
            // window.history.pushState('dashboard', 'Dashboard', '/dashboard');

        });

    }

}

export default new DashboardComponent();