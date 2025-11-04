import { auth } from './auth';

import type ApplicationInstance from '@ember/application/instance';

function configureAuth(app: ApplicationInstance) {
  const authService = app.lookup('service:auth');
  const router = app.lookup('service:router');

  authService.setup(auth);
  authService.subscribe('sessionInvalidated', () => {
    console.log('invalidated, route you off');

    router.transitionTo('application');
  });
}

export function configure(app: ApplicationInstance) {
  configureAuth(app);
}
