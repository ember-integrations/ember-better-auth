import Component from '@glimmer/component';
import { service } from '@ember/service';

import { link } from 'ember-link';

import { AppHeader } from '@hokulea/ember';

import type AuthService from '#/services/auth';

export default class ApplicationRoute extends Component {
  @service declare auth: AuthService;

  <template>
    <AppHeader @home={{link "application"}}>
      <:brand>
        Ember Better Auth Sample
      </:brand>
      <:nav as |m|>
        <m.Item @push={{link "registration"}}>Registration</m.Item>
        <m.Item @push={{link "login"}}>Login</m.Item>
      </:nav>
      <:aux as |n|>
        {{#if this.auth.authenticated}}
          <n.Item>
            <:label>{{this.auth.user.name}}</:label>
            <:menu as |m|>
              <m.Item @push={{link "/user/profile"}}>Profile</m.Item>
              <m.Item @push={{link "/user/sessions"}}>Sessions</m.Item>
              <hr />
              <m.Item @push={{link "/user/logout"}}>Logout</m.Item>
            </:menu>
          </n.Item>
        {{else}}
          <n.Item @push={{link "login"}}>Login</n.Item>
        {{/if}}
      </:aux>
    </AppHeader>

    {{outlet}}
  </template>
}
