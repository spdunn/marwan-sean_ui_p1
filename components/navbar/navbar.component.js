import router from "../../app.js";
import state from "../../util/state.js";

const NAVBAR_ELEMENT = document.getElementById('navbar');

function NavbarComponent() {

    let templateHolder = '';
    let frag = 'components/navbar/navbar.component';

    let logoutNavElement;
    let courseNavElement;

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
        localStorage.clear();
        sessionStorage.clear();
        logoutNavElement.setAttribute('hidden', 'true');
        courseNavElement.setAttribute('hidden', 'true');
        router.navigate('/login');
    }

    this.render = function() {
        injectStylesheet();
        injectTemplate(() => {
            document.getElementById('nav-to-login').addEventListener('click', navigateToView);
            document.getElementById('nav-to-register').addEventListener('click', navigateToView);
            document.getElementById('nav-to-dashboard').addEventListener('click', navigateToView);
            courseNavElement = document.getElementById('nav-to-courses');

            courseNavElement.addEventListener('click', navigateToView);

            logoutNavElement = document.getElementById('logout');
            logoutNavElement.addEventListener('click', logout);

            if(state.authUser) {
                logoutNavElement.removeAttribute('hidden');
                courseNavElement.removeAttribute('hidden');
            } else {
                logoutNavElement.setAttribute('hidden', 'true');
                courseNavElement.setAttribute('hidden', 'true');
            }

        });
    }

}

export default new NavbarComponent();