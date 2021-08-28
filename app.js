import navbarComponent from './components/navbar/navbar.component.js';
import loginComponent from './components/login/login.component.js';
import registerComponent from './components/register/register.component.js';
import dashboardComponent from './components/dashboard/dashboard.component.js';
import state from './util/state.js';

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
    }

];

const router = new Router(routes);

window.onload = () => {
    navbarComponent.render();

    if (sessionStorage.getItem('user') && sessionStorage.getItem('token')) {
        state.authUser = JSON.parse(sessionStorage.getItem('user'));
        state.token = JSON.parse(sessionStorage.getItem('token'));
        router.navigate('/dashboard');
    } else if (localStorage.getItem('user') && localStorage.getItem('token')) {
        state.authUser = JSON.parse(localStorage.getItem('user'));
        state.token = JSON.parse(localStorage.getItem('token'));
        router.navigate('/dashboard');
    } else {
        router.navigate('/login');
    }
}

export default router;