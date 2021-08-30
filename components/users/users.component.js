import { ViewComponent } from '../view.component.js';
import env from '../../util/env.js';
import state from '../../util/state.js';
import router from '../../app.js';

UsersComponent.prototype = new ViewComponent('users');
function UsersComponent() {

    let errorMsg;
    let warnMsg;
    let infoMsg;

    let users;
    let usersTable;

    this.render = function() {
        UsersComponent.prototype.injectStylesheet();
        UsersComponent.prototype.injectTemplate(() => {

            // Send to UserServlet
            fetch(`${env.apiUrl}/users`, {
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

                        users = payload;
                        console.log(users);
                        console.log(state);

                        usersTable = document.getElementById('users-table');
                        populateUsersTable();

                    }
                })
                .catch(err => console.error(err));

        });
    }

    function populateUsersTable() {

        let tableBody = document.createElement('tbody');

        for(let user of users) {
            let row = document.createElement("tr");

            let id = document.createElement("td");
            id.setAttribute('hidden', 'true');
            if(user.id) {
                id.innerText = user.id;
            }
            row.append(id);

            let firstName = document.createElement("td");
            if(user.firstName) {
                firstName.innerText = user.firstName;
            }
            row.append(firstName);

            let lastName = document.createElement("td");
            if(user.lastName) {
                lastName.innerText = user.lastName;
            }
            row.append(lastName);

            let email = document.createElement("td");
            if(user.email) {
                email.innerText = user.email;
            }
            row.append(email);

            let username = document.createElement("td");
            if(user.username) {
                username.innerText = user.username;
            }
            row.append(username);

            let schedule = document.createElement('td');
            let sdiv = document.createElement('div');
            sdiv.setAttribute('class', 'cell-container');
            let courses = document.createElement('div');
            courses.setAttribute('class', 'scroll');
            let courseEntry = '';
            if(user.schedule) {
                for(let course of user.schedule) {
                    if(courseEntry) {
                        courseEntry += '\n';
                    }
                    courseEntry += `${course.deptShort} ${course.courseNo}`;
                }
                courses.innerText = courseEntry;
            } else {
                courses.innerText = '';
            }
            sdiv.append(courses);
            schedule.append(sdiv);
            row.append(schedule);

            let type = document.createElement("td");
            if(user.role) {
                type.innerText = user.role;
            }
            row.append(type);

            tableBody.append(row);
        }

        usersTable.append(tableBody);

    }

}

export default new UsersComponent();