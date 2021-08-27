import { ViewComponent } from '../view.component.js';
import state from '../../util/state.js';
import router from '../../app.js';

DashboardComponent.prototype = new ViewComponent('dashboard');
function DashboardComponent() {

    let welcomeUserElement;

    this.render = function() {

        if (!state.authUser) {
            router.navigate('/login');
            return;
        }

        let currentUsername = state.authUser.username;

        DashboardComponent.prototype.injectStylesheet();
        DashboardComponent.prototype.injectTemplate(() => {

            // welcomeUserElement = document.getElementById('welcome-user');
            // welcomeUserElement.innerText = currentUsername;

            // Append path to end of web address
            // window.history.pushState('dashboard', 'Dashboard', '/dashboard');

        });

    }

}

export default new DashboardComponent();