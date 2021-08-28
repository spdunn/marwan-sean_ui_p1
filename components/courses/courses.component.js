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
    let errorMessageElement;
    let courseList;

    function updateErrorMessage(errorMessage) {
        if (errorMessage) {
            errorMessageElement.removeAttribute('hidden');
            errorMessageElement.innerText = errorMessage;
        } else {
            errorMessageElement.setAttribute('hidden', 'true');
            errorMessageElement.innerText = '';
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
                var cellValue = element[`${j.getAttribute('value')}`];     

                if (!cellValue) cellValue = "";
                // console.log(cellValue);

                if (typeof cellValue === 'object') {
                    if (j.getAttribute('value') == 'meetingTimes') {
                        cellValue = deserializeMeetingTimes(cellValue);
                    }
                    else if (j.getAttribute('value') == 'prerequisites') {
                        cellValue = deserializePrerequisites(cellValue);
                    }
                    console.log(cellValue);
                    // cellValue = JSON.stringify(cellValue);
                    // var tempObject = JSON.parse(cellValue);
                    
                }

                var cell = document.createElement('td');
                cell.appendChild(document.createTextNode(cellValue));
                row.appendChild(cell);

            }
            catalogTableBodyElement.appendChild(row);

        });
    }

    this.render = function() {
        CoursesComponent.prototype.injectStylesheet();
        CoursesComponent.prototype.injectTemplate(() => {
            catalogHeadingElement = document.getElementById('catalog-heading');
            catalogTableElement = document.getElementById('catalog-table');
            catalogTableHeadingElement = document.getElementById('catalog-table-heading');
            catalogTableBodyElement = document.getElementById('catalog-table-body');
            errorMessageElement = document.getElementById('error-msg-container');

            initializeTable();
        })
    }
}

export default new CoursesComponent();