import Component from '@glimmer/component';
import { service } from '@ember/service';

import { getPromiseState } from 'reactiveweb/get-promise-state';

import { Card, Page } from '@hokulea/ember';

import type AuthService from '#/services/auth';

export default class Sessions extends Component {
  @service declare auth: AuthService;

  // eslint-disable-next-line unicorn/consistent-function-scoping
  state = getPromiseState(() => this.auth.client.listSessions());

  <template>
    <Page>
      <h1>Sessions</h1>
      {{#if this.state.resolved}}
        {{#each this.state.resolved.data as |s|}}
          <Card>
            {{s.userAgent}}
          </Card>
        {{/each}}
      {{/if}}
    </Page>
  </template>
}
