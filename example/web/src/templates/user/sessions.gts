import Component from '@glimmer/component';
import { service } from '@ember/service';

import { getPromiseState } from 'reactiveweb/get-promise-state';

import { auth } from '#/auth';

import { Button, Card, Page } from '@hokulea/ember';

import type AuthService from '#/services/auth';

const revokeOtherSessions = auth.revokeOtherSessions;
const revokeSessions = async () => {
  // see: https://github.com/better-auth/better-auth/issues/5741
  await auth.revokeSessions();
  await auth.signOut();
};

export default class Sessions extends Component {
  @service declare auth: AuthService;

  // eslint-disable-next-line unicorn/consistent-function-scoping
  state = getPromiseState(() => this.auth.client.listSessions());

  <template>
    <Page>
      <h1>Sessions</h1>

      <Button @push={{revokeOtherSessions}}>
        Revoke other sessions
      </Button>
      <Button @push={{revokeSessions}}>
        Revoke all sessions
      </Button>

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
