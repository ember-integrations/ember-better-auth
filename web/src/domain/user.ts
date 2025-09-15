import { ability } from 'ember-ability';

import type { BetterAuthUser } from 'ember-better-auth';

export interface User extends BetterAuthUser {
  name: string;
  email: string;
  emailVerified: boolean;
}

export const getUser = ability(({ services }) => () => {
  return services.auth.user;
});

export const isAuthenticated = ability(({ services }) => () => {
  return services.auth.authenticated;
});
