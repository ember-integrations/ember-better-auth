import { auth } from './auth';

import type ApplicationInstance from '@ember/application/instance';

function configureAuth(app: ApplicationInstance) {
  const authService = app.lookup('service:auth');

  authService.setup(auth);
}

export function configure(app: ApplicationInstance) {
  configureAuth(app);
}
