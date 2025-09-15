import { buildRegistry } from 'ember-strict-application-resolver/build-registry';

import { AuthService } from './services/auth';

export const authRegistry = buildRegistry({
  './services/auth': { default: AuthService }
});
