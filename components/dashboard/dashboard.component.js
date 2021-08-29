import { ViewComponent } from '../view.component.js';
import env from '../../util/env.js';
import state from '../../util/state.js';
import router from '../../app.js';

DashboardComponent.prototype = new ViewComponent('dashboard');
function DashboardComponent() {

    let dashboardHeaderName;
    let dashboardHeaderRole;

    let errorMsg;
    let warnMsg;
    let infoMsg;

    let dashboardBody;
    let studentDashFrag;
    let facultyDashFrag;

    let welcomeUserElement;
    let usernameElement;
    let nameElement;
    let emailElement;
    let scheduleElement;

    let user;
    let firstName = '';
    let lastName = '';
    let email = '';
    let schedule = {};

    this.render = function() {

        if (!state.authUser) {
            router.navigate('/login');
            return;
        }

        DashboardComponent.prototype.injectStylesheet();
        DashboardComponent.prototype.injectTemplate(() => {            

            dashboardHeaderName = document.getElementById('dashboard-header-user-name');
            dashboardHeaderRole = document.getElementById('dashboard-header-user-dashboard');

            errorMsg = document.getElementById('error-msg');
            warnMsg = document.getElementById('warn-msg');
            infoMsg = document.getElementById('info-msg');

            dashboardBody = document.getElementById('dashboard-body');
            studentDashFrag = document.getElementById('student-dash-frag');
            facultyDashFrag = document.getElementById('faculty-dash-frag');

            // Send to UserServlet
            fetch(`${env.apiUrl}/users?id=${state.authUser.id}`, {
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
                        user = payload;
                        console.log(user);
                        console.log(state);

                        dashboardHeaderRole.innerHTML = `| ${user.role} dashboard`;
                        dashboardHeaderName.innerHTML = `${user.firstName} ${user.lastName} ` + dashboardHeaderRole.outerHTML;
                        
                        renderStudentFrag();

                    }
                })
                .catch(err => console.error(err));

            // Append path to end of web address
            // window.history.pushState('dashboard', 'Dashboard', '/dashboard');

        });

    }

    function renderStudentFrag() {
        if(user.role === 'student') {
            studentDashFrag.removeAttribute('hidden');
        } else if(user.role === 'faculty') {
            facultyDashFrag.removeAttribute('hidden');
        } else {
            updateAlertMessage('Error: user type not found', 'error');
        }
    }

    function updateAlertMessage(alertMsg, level) {
        if (alertMsg && level === 'error') {
            errorMsg.removeAttribute('hidden');
            errorMsg.innerText = alertMsg;
        } else if (alertMsg && level === 'warn') {
            warnMsg.removeAttribute('hidden');
            warnMsg.innerText = alertMsg;
        } else if (alertMsg && level === 'info') {
            infoMsg.removeAttribute('hidden');
            infoMsg.innerText = alertMsg;
        } else {
            errorMsg.setAttribute('hidden', 'true');
            errorMsg.innerText = '';
            warnMsg.setAttribute('hidden', 'true');
            warnMsg.innerText = '';
            infoMsg.setAttribute('hidden', 'true');
            infoMsg.innerText = '';
        }
    }

}

export default new DashboardComponent();