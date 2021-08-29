import { ViewComponent } from '../view.component.js';
import env from '../../util/env.js';
import state from '../../util/state.js';
import router from '../../app.js';

CoursesComponent.prototype = new ViewComponent('courses');
function CoursesComponent() {
    // Stretch: Courses can be sorted by dept/instructor

    // Users can add course to schedule

    // Faculty can add/edit/remove course

    let catalogHeadingElement;
    let catalogTableElement;
    let catalogTableHeadingElement;
    let catalogTableBodyElement;
    let submitButtonElement;
    let errorMessageElement;
    let modalTitleElement;
    let modalBodyElement;
    let modalButtonElement;

    // Course Creator shit
    let createModalElement;
    let createModalBody;
    let createModalError;
    let createModalSubmit;
    let createModalButtonElement;

    let courseList;
    let selectedCourses = [];
    let currentCourse = {

    };
    let currentCourseHeader = {

    };

    function validate(item) {
        var value = item.value;
        if(item.hasAttribute('required')) {
            if (value.match(/^\s*$/))
                return false;
        }
        switch (item.type) {
            case 'text':
                if (value.match(/^$|^[\w\-\s]+$/)) 
                    return true;
                else return false;
            case 'number':
                console.log(value);
                if (value.match(/^[0-9]+$|^$/))
                    return true;
                else return false;
            default:
                if (value.match(/.*/s))
                    return true;
                else return false;
        }
    }

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
    
    
    function updateErrorMessage(errorMessage) {
        if (errorMessage) {
            errorMessageElement.removeAttribute('hidden');
            errorMessageElement.innerText = errorMessage;
        } else {
            errorMessageElement.setAttribute('hidden', 'true');
            errorMessageElement.innerText = '';
        }
    }

    function updateSubmitButton(e) {
        selectedCourses = [];
        var inputElements = document.getElementsByTagName("input");
        var checked = false;
        for (var i = 0; i < inputElements.length; i++) {
            if (inputElements[i].type == "checkbox") {
                if (inputElements[i].checked) {
                    checked = true;
                    selectedCourses.push(inputElements[i].id);
                }
            }
        }

        modalTitleElement.innerText = 'Are you sure you want to delete ';
        if (checked) {
            submitButtonElement.style.display = "block";
            submitButtonElement.innerText = "Delete Courses";            
            modalTitleElement.innerText += `${selectedCourses.length}` + ' course(s)?';
            modalBodyElement.innerText = selectedCourses;

        }
        else {
            submitButtonElement.style.display = "none";
            submitButtonElement.innerText = "";
            modalBodyElement.innerText = '';
        }
    }

    // Add Course to User Schedule
    function updateScheduleModal(e) {
        currentCourse = courseList.find(element => element.id === e.target.id);
        // console.log(currentCourse);
        let scheduleModalBody = document.getElementById('scheduleModalBody');
        scheduleModalBody.innerText = currentCourse.title + '\n' + currentCourse.deptShort + ' ' + currentCourse.courseNo + ' - ' + currentCourse.sectionNo; 
    }

    async function addToSchedule() {
        // Send fetch to Users Patch with currentUser and currentCourse
        // currentCourseHeader = {
        //     courseDept: `${currentCourse.deptShort}`,
        //     courseNo: `${currentCourse.courseNo}`,
        //     sectionNo: `${currentCourse.sectionNo}`,
        //     meetingTimes: `${currentCourse.meetingTimes}`
        // }
        // console.log(currentCourseHeader);
        // authUser.schedule.push()
        
        // Get Current User (For Schedule)
        let currentUser = {};
        try {
            let currentUserResp = await fetch(`${env.apiUrl}/users?id=${state.authUser.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `${state.token}`
                }
            });
            currentUser = await currentUserResp.json();
        } catch (error) {
            console.log(error);            
            return;
        }
        let schedule = currentUser.schedule;
        schedule.push(`${currentCourse.id}`);
        let updatedUser = {
            id: state.authUser.id,
            schedule: schedule
        }
        console.log(JSON.stringify(updatedUser));
        try {
            let resp = await fetch(`${env.apiUrl}/users?id=${state.authUser.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': state.token
                },
                body: JSON.stringify(updatedUser)
            });
            let payload = await resp.json();
            if (resp.status != 200) {
                console.log('ERroR');
                createModalError.removeAttribute('hidden');
                createModalError.style.color = 'red';
                createModalError.innerText = 'ERROR: ' + payload.message;
                return;
            } 
        } catch (error) {
            console.log(error);            
            return;
        }
        // TODO: Currently sends user back to home, possibly even refresh session?
        // location.reload(true);
    }

    // CRUD: CREATE
    async function createCourse() {
        createModalElement = document.getElementById('createModal');
        createModalBody = document.getElementById('createModalBody');
        createModalError = document.getElementById('create-error-msg');
        // createModalMeetingTimes = document.getElementById('course-form-meetingtimes');
        // createModalPrereqs = document.getElementById('course-form-prerequisites');

        createModalError.setAttribute('hidden', 'true');
        createModalError.style.color = 'black';
        createModalError.innerText = '';

        var fields = document.getElementById('createModalBody').querySelectorAll('.form-control');

        let newCourse = {

        }

        // Validate fields and append to course
        for (let element of fields) {
            if(!validate(element)) {
                console.log('ERroR');
                createModalError.removeAttribute('hidden');
                createModalError.style.color = 'red';
                createModalError.innerText = `ERROR: ${element.placeholder} is invalid!`;
                return;
            }

            if (!element.value.match(/^\s*$/)) {
                var att = element.classList.item(1);
                // newCourse.
                newCourse[`${att}`] = element.value;
            }

        }

        // Send new course to servlet
        try {
            let resp = await fetch(`${env.apiUrl}/courses`, {
                method: 'POST',
                headers: {
                    'Authorization': `${state.token}`
                },
                body: JSON.stringify(newCourse)
            });
            let payload = await resp.json();
            if (resp.status != 200) {
                console.log('ERroR');
                createModalError.removeAttribute('hidden');
                createModalError.style.color = 'red';
                createModalError.innerText = 'ERROR: ' + payload.message;
                return;
            } 
        } catch (error) {
            console.log(error);            
            return;
        }
        // TODO: Currently sends user back to home, possibly even refresh session?
        location.reload(true);
        

    }

    // CRUD: READ
    async function initializeTable() {
        // fetch list of courses in database
        try {
            let resp = await fetch(`${env.apiUrl}/courses`, {
                method: 'GET'
            })
            let payload = await resp.json();
            courseList = payload;
        } catch (error) {
            console.log(error);
            return;
        }            

        courseList.forEach(element => {
            var row = document.createElement('tr');

            // Add delete checkboxes for faculty before table
            if (state.authUser.role === 'faculty' || state.authUser.role === 'pendingFaculty') {
                var checkbox = document.createElement("INPUT"); //Added for checkbox
                checkbox.type = "checkbox"; //Added for checkbox
                checkbox.id = element['id'];
                checkbox.addEventListener('change', updateSubmitButton);
                row.appendChild(checkbox);
            }
            // else 

            // console.log(element.title);
            for (let j of catalogTableHeadingElement.cells) {
                // console.log(j.getAttribute('value'));
                var cellField = j.getAttribute('value');

                if (state.authUser.role === 'faculty' && cellField === 'delete') continue;

                var cellValue = element[`${cellField}`]; 

                var cell = document.createElement('td');                 

                if (!cellValue) cellValue = "";
                // console.log(cellValue);

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

            var button = document.createElement('button');
            button.id = element['id'];
            button.type = 'button';
            button.classList.remove(...button.classList);
            button.classList.add('btn', 'btn-info');
            // Add Add Course button for students, Edit Course button for faculty
            if (state.authUser.role === 'faculty' || state.authUser.role === 'pendingFaculty') {    
                button.innerHTML = 'Edit Course';
                button.setAttribute('data-bs-toggle', 'modal');
                button.setAttribute('data-bs-target', '#updateModal');
                button.addEventListener('click', updateModal);
            } else if (state.authUser.role === 'student') {
                button.innerHTML = 'Add Course';
                button.setAttribute('data-bs-toggle', 'modal');
                button.setAttribute('data-bs-target', '#scheduleModal');
                button.addEventListener('click', updateScheduleModal);
            }
            row.appendChild(button);
            console.log(button);

            catalogTableBodyElement.appendChild(row);

        });
    }

    // CRUD: UPDATE
    async function updateCourse(e) {
        // console.log(e);
        // console.log(e.target);
        // console.log(e.target.value);

        let updateModalElement = document.getElementById('updateModal');
        let updateModalBody = document.getElementById('updateModalBody');
        let updateModalError = document.getElementById('update-error-msg');
        // createModalMeetingTimes = document.getElementById('course-form-meetingtimes');
        // createModalPrereqs = document.getElementById('course-form-prerequisites');

        updateModalError.setAttribute('hidden', 'true');
        updateModalError.style.color = 'black';
        updateModalError.innerText = '';

        var fields = document.getElementById('updateModalBody').querySelectorAll('.form-control');

        let updatedCourse = {

        };

        console.log(currentCourse);

        // Validate fields and append to course
        for (let element of fields) {
            // Field has not changed
            if (element.value == currentCourse[`${element.classList[1]}`] || (element.value == '' && !currentCourse[`${element.classList[1]}`])) {
                console.log(element.value);
                continue;
            }
            if(!validate(element)) {
                console.log('ERroR');
                createModalError.removeAttribute('hidden');
                createModalError.style.color = 'red';
                createModalError.innerText = `ERROR: ${element.placeholder} is invalid!`;
                return;
            }

            var att = element.classList.item(1);
            updatedCourse[`${att}`] = element.value;

        }
        // Check if object is empty
        if (Object.keys(updatedCourse).length === 0 && updatedCourse.constructor === Object) {
            console.log('ERroR');
            updateModalError.removeAttribute('hidden');
            updateModalError.style.color = 'red';
            updateModalError.innerText = `ERROR: You have not updated any fields!`;
            return;
        }
        // console.log(updatedCourse);

        updatedCourse.id = currentCourse.id;

        // console.log(JSON.stringify(updatedCourse));

        // Send to Java Servlet
        try {
            let resp = await fetch(`${env.apiUrl}/courses`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `${state.token}`
                },
                body: JSON.stringify(updatedCourse)
            });
            let payload = await resp.json();
            if (resp.status != 200) {
                console.log('ERroR');
                updateModalError.removeAttribute('hidden');
                updateModalError.style.color = 'red';
                updateModalError.innerText = 'ERROR: ' + payload.message;
                return;
            } 
        } catch (error) {
            console.log(error);            
            return;
        }
        // TODO: Currently sends user back to home, possibly even refresh session?
        location.reload(true);
        
    }

    function updateModal(e) {
        var fields = document.getElementById('updateModalBody').querySelectorAll('.form-control');

        currentCourse = courseList.find(element => element.id === e.target.id);
        console.log(currentCourse);
        for (let element of fields) {
            if (currentCourse[`${element.classList[1]}`]) {
                element.value = currentCourse[`${element.classList[1]}`];
            }
        }
                
    }

    // CRUD: DELETE
    async function deleteCourses() {
        // fetch list of courses in database
        try {
            let deleteString = '';
            for (let course of selectedCourses) {
                deleteString += `id=${course}&`;
            }
            deleteString = deleteString.slice(0, -1);
            console.log(deleteString);
            let resp = await fetch(`${env.apiUrl}/courses?${deleteString}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `${state.token}`
                }
            });            
            let payload = await resp.json();
            if (resp.status != 200) {
                modalBodyElement.style.color = 'red';
                modalBodyElement.innerText = 'ERROR: ' + payload.message;
                return;
            } 
        } catch (error) {
            console.log(error);            
            return;
        }
        // TODO: Currently sends user back to home, possibly even refresh session?
        location.reload(true);
    }

    this.render = function() {
        CoursesComponent.prototype.injectStylesheet();
        CoursesComponent.prototype.injectTemplate(() => {
            catalogHeadingElement = document.getElementById('catalog-heading');
            catalogTableElement = document.getElementById('catalog-table');
            catalogTableHeadingElement = document.getElementById('catalog-table-heading');
            catalogTableBodyElement = document.getElementById('catalog-table-body');
            submitButtonElement = document.getElementById('submit-course-button')
            errorMessageElement = document.getElementById('error-msg-container');

            modalTitleElement = document.getElementById('confirmModalTitle');
            modalBodyElement = document.getElementById('confirmModalBody');
            modalButtonElement = document.getElementById('deleteButton');

            createModalSubmit = document.getElementById('create-course-button');
            createModalSubmit.addEventListener('click', createCourse);

            createModalButtonElement = document.getElementById('create-modal-button');
            if (state.authUser.role === 'faculty' || state.authUser.role === 'pendingFaculty') {
                createModalButtonElement.removeAttribute('hidden');
            } else {
                createModalButtonElement.setAttribute('hidden', 'true');
            }

            submitButtonElement.onclick = function() {
                updateSubmitButton();
                modalBodyElement.style.color = 'black';
            }
            modalButtonElement.addEventListener('click', deleteCourses);

            let updateModalButtonElement = document.getElementById('update-course-button');
            updateModalButtonElement.addEventListener('click', updateCourse);
            // updateModalElement.addEventListener('show.bs.modal', updateModal);

            let scheduleModalButtonElement = document.getElementById('scheduleButton');
            scheduleModalButtonElement.addEventListener('click', addToSchedule);

            initializeTable();
        })
    }
}

export default new CoursesComponent();