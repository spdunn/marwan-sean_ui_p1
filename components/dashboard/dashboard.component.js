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
    
    let scheduleTableElement;
    let scheduleTableHeadingElement;
    let scheduleTableBodyElement;

    function deserializeMeetingTimes(cellValue) {
        var tempObject = cellValue;                    
        cellValue = '';
        for (const[index, obj] of Object.entries(tempObject)) {
            if (index != 0) cellValue += '\n';

            cellValue += obj.day + ' ';

            var startTime = obj['startTime'] + '';
            startTime = startTime.replace(/(.{2})$/,':$1');
            cellValue += startTime + ' - ';

            var endTime = obj['endTime'] + '';
            endTime = endTime.replace(/(.{2})$/,':$1');
            cellValue += endTime + ' ';

            cellValue += '(' + obj.classType + ')';            
        }
        return cellValue;
    }

    function deserializePrerequisites(cellValue) {
        var tempObject = cellValue;                    
        cellValue = '';
        for (const[index, obj] of Object.entries(tempObject)) {
            if (index != 0) cellValue += '\n';

            cellValue += obj.department + ' ';
            cellValue += obj.courseNo + ' ';
            if (obj.credits == 1) cellValue += '(' + obj.credits + ' Credit)';
            else cellValue += '(' + obj.credits + ' Credits)';
        }
        return cellValue;
    }

    async function initializeDashboard() {
        // Send to UserServlet
        await fetch(`${env.apiUrl}/users?id=${state.authUser.id}`, {
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
                    
                    if(user.role === 'student') {
                        renderStudentFrag();
                    } else if(user.role === 'faculty') {
                        renderFacultyFrag();
                    } else {
                        updateAlertMessage('Error: user type not found', 'error');
                    }
                    

                }
            })
            .catch(err => console.error(err));

        let courseList = [];
        if (user.schedule.length > 0) {
            console.log(user.schedule);
            for (let course of user.schedule) {
                console.log(course);
                try {
                    var courseResp = await fetch(`${env.apiUrl}/courses?id=${course.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    var coursePayload = await courseResp.json();
                    if (courseResp.header === 400) {
                        updateErrorMessage(payload.message);
                    } else {
                        // Update Dashboard with Course data
                        courseList.push(coursePayload);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
            console.log(courseList);
        } else return;  // If no courses, don't continue with rest of logic

        scheduleTableElement = document.getElementById('schedule-table');
        scheduleTableHeadingElement = document.getElementById('schedule-table-heading');
        scheduleTableBodyElement = document.getElementById('schedule-table-body');

        courseList.forEach(element => {
            var row = document.createElement('tr');

            for (let j of scheduleTableHeadingElement.cells) {
                var cellField = j.getAttribute('id');
                console.log(cellField);

                var cellValue = element[`${cellField}`]; 

                var cell = document.createElement('td');

                if (typeof cellValue === 'object') {
                    if (cellField == 'meetingTimes') {
                        cell.id = 'meetingTimes';
                        cellValue = deserializeMeetingTimes(cellValue);
                    }
                    else if (cellField == 'prerequisites') {
                        cell.id = 'prerequisites';
                        cellValue = deserializePrerequisites(cellValue);
                    }
                    console.log(cellValue);
                    // cellValue = JSON.stringify(cellValue);
                    // var tempObject = JSON.parse(cellValue);
                    
                }

                cell.appendChild(document.createTextNode(cellValue));
                row.appendChild(cell);
            }

            scheduleTableBodyElement.appendChild(row);
            
        })
    }

    function renderStudentFrag() {
        studentDashFrag.removeAttribute('hidden');        
    }

    function renderFacultyFrag() {
        facultyDashFrag.removeAttribute('hidden');
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

            initializeDashboard();

            // Append path to end of web address
            // window.history.pushState('dashboard', 'Dashboard', '/dashboard');

        });

    }

    

}

export default new DashboardComponent();