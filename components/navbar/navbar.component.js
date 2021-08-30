import router from "../../app.js";
import state from "../../util/state.js";

const NAVBAR_ELEMENT = document.getElementById('navbar');

function NavbarComponent() {

    let templateHolder = '';
    let frag = 'components/navbar/navbar.component';

    let loginNavElement;
    let registerNavElement;
    let homeNavElement;
    let logoutNavElement;
    let courseNavElement;
    let userNavElement;

    function injectTemplate(callback) {

        if (templateHolder) {
            NAVBAR_ELEMENT.innerHTML = templateHolder;
        } else {
            fetch(`${frag}.html`)
                .then(resp => resp.text())
                .then(html => {
                    templateHolder = html;
                    NAVBAR_ELEMENT.innerHTML = templateHolder;
                    callback();
                })
                .catch(err => console.error(err));
        }
    }

    function injectStylesheet() {
        let dynamicStyle = document.getElementById('nav-css');
        if (dynamicStyle) dynamicStyle.remove();
        dynamicStyle = document.createElement('link');
        dynamicStyle.id = 'nav-css';
        dynamicStyle.rel = 'stylesheet';
        dynamicStyle.href = `${frag}.css`;
        document.head.appendChild(dynamicStyle);
    }

    function navigateToView(e) {
        router.navigate(e.target.dataset.route);
    }

    function logout() {
        console.log('Logging you out!');
        state.authUser = '';
        state.token = '';
        localStorage.clear();
        sessionStorage.clear();
        loginNavElement.removeAttribute('hidden');
        registerNavElement.removeAttribute('hidden');
        homeNavElement.setAttribute('hidden', 'true');
        logoutNavElement.setAttribute('hidden', 'true');
        courseNavElement.setAttribute('hidden', 'true');
        userNavElement.setAttribute('hidden', 'true');
        router.navigate('/login');
    }

    this.render = function() {
        injectStylesheet();
        injectTemplate(() => {
            // document.getElementById('nav-to-dashboard').addEventListener('click', navigateToView);

            loginNavElement = document.getElementById('nav-to-login');
            loginNavElement.addEventListener('click', navigateToView);
            registerNavElement = document.getElementById('nav-to-register');
            registerNavElement.addEventListener('click', navigateToView);
            
            homeNavElement = document.getElementById('nav-to-dashboard-home');
            homeNavElement.addEventListener('click', navigateToView);

            courseNavElement = document.getElementById('nav-to-courses');
            courseNavElement.addEventListener('click', navigateToView);

            userNavElement = document.getElementById('nav-to-users');
            userNavElement.addEventListener('click', navigateToView);

            logoutNavElement = document.getElementById('logout');
            logoutNavElement.addEventListener('click', logout);

            if(state.authUser) {
                loginNavElement.setAttribute('hidden', 'true');
                registerNavElement.setAttribute('hidden', 'true');
                homeNavElement.removeAttribute('hidden');
                logoutNavElement.removeAttribute('hidden');
                courseNavElement.removeAttribute('hidden');
                if(state.authUser.role === 'faculty') {
                    userNavElement.removeAttribute('hidden');
                } else {
                    userNavElement.setAttribute('hidden', 'true');
                }
            } else {
                loginNavElement.removeAttribute('hidden');
                registerNavElement.removeAttribute('hidden');
                homeNavElement.setAttribute('hidden', 'true');
                logoutNavElement.setAttribute('hidden', 'true');
                courseNavElement.setAttribute('hidden', 'true');
                userNavElement.setAttribute('hidden', 'true');
            }

        });
    }

}

export default new NavbarComponent();