import { AuthService as UpstreamAuthService } from 'ember-better-auth';

import type { User } from '../domain/user';

export default class AuthService extends UpstreamAuthService<User> {}

declare module '@ember/service' {
  interface Registry {
    auth: AuthService;
  }
}
