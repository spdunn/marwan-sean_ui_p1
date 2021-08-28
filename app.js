import navbarComponent from './components/navbar/navbar.component.js';
import loginComponent from './components/login/login.component.js';
import registerComponent from './components/register/register.component.js';
import dashboardComponent from './components/dashboard/dashboard.component.js';
import coursesComponent from './components/courses/courses.component.js';

import { Router } from "./util/router.js";

//-----------------------------------------------------------------------------------

let routes = [

    {
        path: '/login',
        component: loginComponent
    },
    {
        path: '/register',
        component: registerComponent
    },
    {
        path: '/dashboard',
        component: dashboardComponent
    },
    {
        path: '/courses',
        component: coursesComponent
    }

];

const router = new Router(routes);

window.onload = () => {
    navbarComponent.render();
    router.navigate('/login');
}

export default router;