import { ViewComponent } from '../view.component.js';
import env from '../../util/env.js';
import state from '../../util/state.js';
import router from '../../app.js';

CoursesComponent.prototype = new ViewComponent('courses');
function CoursesComponent() {
    // Display list of courses

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

    let courseList;
    let selectedCourses = [];

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
            // console.log(element.title);
            for (let j of catalogTableHeadingElement.cells) {
                // console.log(j.getAttribute('value'));
                var cellField = j.getAttribute('value');
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
                }                
                cell.appendChild(document.createTextNode(cellValue));
                row.appendChild(cell);

            }

            var checkbox = document.createElement("INPUT"); //Added for checkbox
            checkbox.type = "checkbox"; //Added for checkbox
            checkbox.id = element['id'];
            checkbox.addEventListener('change', updateSubmitButton);
            row.appendChild(checkbox);

            catalogTableBodyElement.appendChild(row);

        });
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

    async function deleteCourses() {
        // fetch list of courses in database
        try {
            let resp = await fetch(`${env.apiUrl}/courses`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `${state.token}`
                }
            })            
            let payload = await resp.json();
            if (payload.statusCode === 401) {
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

            submitButtonElement.onclick = function() {
                updateSubmitButton();
                modalBodyElement.style.color = 'black';
            }
            modalButtonElement.addEventListener('click', deleteCourses);

            initializeTable();
        })
    }
}

export default new CoursesComponent();