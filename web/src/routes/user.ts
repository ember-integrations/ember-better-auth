import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type AuthService from '../services/auth';
import type Transition from '@ember/routing/transition';

export default class UserRoute extends Route {
  @service declare auth: AuthService;

  async beforeModel(transition: Transition) {
    const authenticated = await this.auth.requireAuthentication(transition);

    if (!authenticated) {
      this._router.transitionTo('login');
    }
  }
}
