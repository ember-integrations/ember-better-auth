import { tracked } from '@glimmer/tracking';
import { next } from '@ember/runloop';
import Service from '@ember/service';

import Publisher, { type Subscriber } from '../utils/observer';

import type Transition from '@ember/routing/transition';
import type { createAuthClient } from 'better-auth/client';

export interface BetterAuthUser {
  id: string;
  image?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
}

type Data<User extends BetterAuthUser> = { user: User; session: Session };

type AuthClient = ReturnType<typeof createAuthClient>;

export interface AuthEvents<User extends BetterAuthUser> {
  sessionAuthenticated: [Data<User>];
  sessionInvalidated: [];
}

export class AuthService<User extends BetterAuthUser = BetterAuthUser> extends Service {
  client!: AuthClient;
  #publisher = new Publisher<AuthEvents<User>>();

  #attemptedTransition?: Transition;

  @tracked loading = false;
  @tracked internalData?: Data<User> = undefined;

  get user(): User | undefined {
    return this.internalData?.user;
  }

  get authenticated() {
    return Boolean(this.user !== undefined);
  }

  subscribe<E extends keyof AuthEvents<User>>(event: E, cb: Subscriber<AuthEvents<User>, E>) {
    this.#publisher.subscribe(event, cb);
  }

  unsubscribe<E extends keyof AuthEvents<User>>(event: E, cb: Subscriber<AuthEvents<User>, E>) {
    this.#publisher.unsubscribe(event, cb);
  }

  requireAuthentication(transition: Transition) {
    return new Promise((resolve) => {
      if (this.authenticated) {
        resolve(this.authenticated);
      }

      const handleAuthentication = () => {
        if (!this.authenticated) {
          this.#attemptedTransition = transition;
        }

        resolve(this.authenticated);
      };

      const waitUntilLoadingIsComplete = () => {
        if (this.loading) {
          // eslint-disable-next-line ember/no-runloop
          return next(waitUntilLoadingIsComplete);
        }

        handleAuthentication();
      };

      if (this.loading) {
        // eslint-disable-next-line ember/no-runloop
        next(waitUntilLoadingIsComplete);
      } else {
        handleAuthentication();
      }
    });
  }

  setup = (auth: AuthClient) => {
    this.client = auth;

    if (auth.useSession.value?.data) {
      this.internalData = auth.useSession.value.data as unknown as { user: User; session: Session };
    }

    this.loading = !this.internalData;

    auth.useSession.subscribe((payload) => {
      if (!payload.isPending) {
        if (payload.data?.user && !this.authenticated) {
          this.#handleSessionAuthenticated(payload.data as unknown as Data<User>);
        } else if (!payload.data?.user && this.authenticated) {
          this.#handleSessionInvalidated();
        }
      }

      this.loading = payload.isPending;
      this.internalData =
        (payload.data as unknown as { user: User; session: Session } | undefined) ?? undefined;
    });
  };

  #handleSessionAuthenticated(data: Data<User>) {
    if (this.#attemptedTransition) {
      this.#attemptedTransition.retry();

      this.#attemptedTransition = undefined;
    }

    this.#publisher.notify('sessionAuthenticated', data);
  }

  #handleSessionInvalidated() {
    this.#publisher.notify('sessionInvalidated');
  }
}
