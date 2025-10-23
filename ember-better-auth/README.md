# ember-better-auth

Integrates [`better-auth`](https://www.better-auth.com/) with Ember's reactivity
system, while at the same time mimicing the API from
[`ember-simple-auth`](https://ember-simple-auth.com/).

## Compatibility

- Ember.js with vite

## Installation

```sh
ember install ember-better-auth better-auth
```

## Example

This repo contains an example for a server with Hono and a web app with Ember.

## Setup

This setup expects the server for better-auth is already done and
operationg on `http://localhost:3000`. This setup will guide you configuring
better-auth for ember on the client side.

### 1. Auth Service

`ember-better-auth` provides an `AuthService` that you need to use and configure
to your liking and load the service according to the [Strict Reslover
RFC](https://rfcs.emberjs.com/id/1132-default-strict-resolver).

#### A) Use the Registry

`ember-better-auth` ships with a registry function for usage with the
[`ember-strict-application-resolver`](https://github.com/ember-cli/ember-strict-application-resolver)
package.

```ts
// src/app.ts
import EmberApp from 'ember-strict-application-resolver';

import { authRegistry } from 'ember-better-auth/registry';

class Router extends EmberRouter {
  location = 'history';
  rootURL = '/';
}

Router.map(function () {
  // your routes
});

export default class App extends EmberApp {
  modules = {
    './router': { default: Router },
    ...authRegistry(),
    ...import.meta.glob('./services/**/*', { eager: true }),
    ...import.meta.glob('./routes/**/*', { eager: true }),
    ...import.meta.glob('./templates/**/*', { eager: true })
  };
}
```

#### B) Your own Service (for your own User type)

This is great if you already have a `User` type you want to use, and/or
you defined custom fields for your user, then this is a way to expand the types
provided by better-auth

```ts
// src/domain/user.ts
import type { BetterAuthUser } from 'ember-better-auth';

export interface User extends BetterAuthUser {
  name: string;
  email: string;
  emailVerified: boolean;
  givenName?: string;
  familyName?: string;
}
```

Then extend the `auth` service and configure it with the `User` type.

```ts
// src/services/auth.ts
import { AuthService as UpstreamAuthService } from 'ember-better-auth';

import type { User } from '../domain/user';

export default class AuthService extends UpstreamAuthService<User> {}

declare module '@ember/service' {
  interface Registry {
    auth: AuthService;
  }
}
```

Don't forget to load this service as part of your registry.

### 2. Auth Client

Start by creating an `authClient`:

```ts
// src/auth.ts
import { createAuthClient } from 'better-auth/client';

// here you configure your auth client, eg. plugins you plan to use
export const auth = createAuthClient({
  baseURL: 'http://localhost:3000'
});
```

### 3. Connect Auth Client with Auth Service

Now that the client and the service are ready, let's connect them, so they know
each other. Here again, there are two places in which you can do that

#### A) In `ApplicationRoute`

That's the place you know where to configure your app:

```ts
// src/routes/application.ts
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { auth } from '../auth';

import type AuthService from '../services/auth';

export default class ApplicationRoute extends Route {
  @service('auth') declare authService: AuthService;

  async beforeModel() {
    authService.setup(auth);
  }
}
```

#### B) Use App config

A slightly different approach is to stop the autoboot for your app and configure
it a bit more verbose:

```ts
// src/app.ts

// see above

export function createApp(options: Record<string, unknown> = {}) {
  const app = App.create({ ...options, autoboot: false });

  return app.buildInstance();
}

export async function start(instance: ApplicationInstance) {
  await instance.boot();

  instance.startRouting();
}
```

then start your app in `index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- snip-->
  </head>
  <body>
    <script type="module">
      import { createApp, start } from './src/app';
      import { configure } from './src/config';

      const app = createApp();

      configure(app);
      start(app);
    </script>
  </body>
</html>
```

And then have a dedicated config:

```ts
// src/config.ts
import { auth } from './auth';

import type ApplicationInstance from '@ember/application/instance';

function configureAuth(app: ApplicationInstance) {
  const authService = app.lookup('service:auth');

  authService.setup(auth);
}

export function configure(app: ApplicationInstance) {
  configureAuth(app);

  // more configs, yay :party:
  // configureIntl(app)
}
```

## Usage

For most parts, you can import the `auth` client directly and follow the
better-auth documentation.

The interesting bit is that the `auth` client is connected with the
`AuthService` which itself tracks a users logged in state and can react to it.

### Showing the Logged in User

So here is the application route showing the logged in user in the header of the
Page.

```glimmer-ts
// src/templates/application.gts
import Component from '@glimmer/component';
import { service } from '@ember/service';

import type AuthService from '../services/auth';

export default class ApplicationRoute extends Component {
  @service declare auth: AuthService;

  <template>
    <header>
      {{#if this.auth.authenticated}}
        Hi {{this.auth.user.name}}

        <Link @href="/user/profile">Profile</Link>
        <Link @href="/user/sessions">Sessions</Link>

        <Link @href="/user/logout">Logout</Link>
      {{else}}
        <Link @href="/login">Login</Link>
      {{/if}}
    </header>

    {{outlet}}
  </template>
}
```

### Login

Here is a login route using the
[`action()`](https://gossi.github.io/ember-command/actions.html) from
[`ember-command`](https://github.com/gossi/ember-command):

```glimmer-ts
// src/templates/login.gts
import { action } from 'ember-command';

import { FocusPage, Form } from '@hokulea/ember';

import { auth } from '../auth';

const login = action(
  ({ services: { router } }) =>
    async (data: { email: string; password: string }) => {
      await auth.signIn.email(data, {
        onSuccess: () => {
          router.transitionTo('user.profile');
        }
      });
    }
);

<template>
  <FocusPage @title="Login">
    <Form @submit={{(login)}} as |f|>
      <f.Email @name="email" @label="Email" required />

      <f.Password @name="password" @label="Password" required />

      <f.Submit>Login</f.Submit>
    </Form>
  </FocusPage>
</template>
```

### Logout

Logging out people using the logout route:

```ts
// src/routes/user/logout.ts
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
```

### Protected Routes

The auth service can verify if the user is logged in and allow routing based on
that check. From the example above, let's make every `/user/*` route protected
for only logged in users

```ts
// src/routes/user.ts
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
```

### Reacting to Login/Logout Events

The `AuthService` emits events on certain ocasions you can subscribe to. For
example to route people after login/logout.

```ts
// in your configure

function configureAuth(auth: AuthService) {
  auth.subscribe('sessionAuthenticated', (user) => {
    // do sth with `user`
  });

  auth.subscribe('sessionInvalidated', () => {
    // user is logged out - maybe route them?
  });
}
```
