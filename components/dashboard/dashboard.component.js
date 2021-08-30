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


    }

    function renderStudentFrag() {
        let scheduleEmptyMsg = document.getElementById('empty-schedule');
        let schedule = document.getElementById('schedule');
        let scheduleTable = document.getElementById('schedule-table');

        studentDashFrag.removeAttribute('hidden');

        if(user.schedule) {
            scheduleEmptyMsg.setAttribute('hidden', 'true');
            schedule.removeAttribute('hidden');
        }

        populateScheduleTable(scheduleTable);

    }

    async function dropCourseById(e) {
        let id = e.target.getAttribute('value');
        for(let index in user.schedule) {
            if(user.schedule[index].id === id) {
                user.schedule.splice(index, 1);
                break;
            }
        }

        await fetch(`${env.apiUrl}/users`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${state.token}`
            },
            body: JSON.stringify(user)
        })

        location.reload(true);

    }

    function populateScheduleTable(scheduleTable) {

        let tableBody = document.createElement("tbody");

        let schedule = user.schedule;
        for(let course of schedule) {
            let row = document.createElement("tr");

            let id = document.createElement("td");
            id.setAttribute('hidden', 'true');
            if(course.id) {
                id.innerText = course.id;
            }
            row.append(id);

            let title = document.createElement("td");
            if(course.title) {
                title.innerText = course.title;
            }
            row.append(title);

            let deptShort = document.createElement("td");
            if(course.deptShort) {
                deptShort.innerText = course.deptShort;
            }
            row.append(deptShort);

            let courseNo = document.createElement("td");
            if(course.courseNo) {
                courseNo.innerText = course.courseNo;
            }
            row.append(courseNo);

            let sectionNo = document.createElement("td");
            if(course.sectionNo) {
                sectionNo.innerText = course.sectionNo;
            }
            row.append(sectionNo);

            let instructor = document.createElement("td");
            if(course.instructor) {
                instructor.innerText = course.instructor;
            } else {
                instructor.innerText = 'TBA';
            }
            row.append(instructor);

            let credits = document.createElement("td");
            if(course.credits) {
                credits.innerText = course.credits;
            }
            row.append(credits);

            let meetingTimesCell = document.createElement('td');
            let mdiv = document.createElement('div');
            mdiv.setAttribute('class', 'cell-container');
            let meetingTimes = document.createElement('div');
            meetingTimes.setAttribute('class', 'scroll');
            let meetingTimeEntry = '';
            if(course.meetingTimes) {
                for(let meet of course.meetingTimes) {
                    if(meetingTimeEntry) {
                        meetingTimeEntry += '\n';
                    }
                    meetingTimeEntry += `${meet.day} ${meet.startTime} - ${meet.endTime}\n(${meet.classType})`;
                }
                meetingTimes.innerText = meetingTimeEntry;
            } else {
                meetingTimes.innerText = 'TBA';
            }
            mdiv.append(meetingTimes);
            meetingTimesCell.append(mdiv);
            row.append(meetingTimesCell);

            let deleteTd = document.createElement('td');
            let deleteBtn = document.createElement('button');
            deleteBtn.setAttribute('value', course.id);
            deleteBtn.setAttribute('type', 'button');
            deleteBtn.setAttribute('class', 'btn btn-danger');
            deleteBtn.innerText = 'drop';
            deleteBtn.addEventListener('click', dropCourseById);
            deleteTd.append(deleteBtn);
            row.append(deleteTd);

            tableBody.append(row);
        }

        scheduleTable.append(tableBody);

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