import EmberRouter from '@ember/routing/router';

import EmberApp from 'ember-strict-application-resolver';

import '@hokulea/core/index.css';
import { hokuleaRegistry } from '@hokulea/ember/registry';

import type ApplicationInstance from '@ember/application/instance';

class Router extends EmberRouter {
  location = 'history';
  rootURL = '/';
}

Router.map(function () {
  /* eslint-disable @typescript-eslint/no-invalid-this */
  this.route('registration');
  this.route('login');
  this.route('user', function () {
    this.route('profile');
    this.route('sessions');
    this.route('logout');
  });
  /* eslint-enable @typescript-eslint/no-invalid-this */
});

export default class App extends EmberApp {
  modules = {
    './router': { default: Router },
    ...hokuleaRegistry(),
    // now import.meta.glob just works
    ...import.meta.glob('./services/**/*', { eager: true }),
    ...import.meta.glob('./routes/**/*', { eager: true }),
    ...import.meta.glob('./templates/**/*', { eager: true })
  };
}

export function createApp(options: Record<string, unknown> = {}) {
  const app = App.create({ ...options, autoboot: false });

  return app.buildInstance();
}

export async function start(instance: ApplicationInstance) {
  await instance.boot();

  instance.startRouting();
}
