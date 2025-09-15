import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type AuthService from '../../services/auth';

export default class LogoutRoute extends Route {
  @service declare auth: AuthService;

  async beforeModel() {
    await this.auth.client.signOut({
      fetchOptions: {
        onSuccess: () => {
          this._router.transitionTo('application');
        }
      }
    });
  }
}
