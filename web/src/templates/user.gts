import PhClockClockwise from '~icons/ph/clock-clockwise';
import PhUser from '~icons/ph/user';

import { NavigationList, Page } from '@hokulea/ember';

import { getUser } from '../domain/user';

<template>
  <style>
    .user {
      display: grid;
      grid-template-columns: 30% auto;
      gap: var(--spacing-container0);
    }
  </style>

  <Page>
    <:title>
      {{#let (getUser) as |user|}}
        {{#if user}}
          {{user.name}}
        {{else}}
          &nbsp;
        {{/if}}
      {{/let}}
    </:title>
    <:content>

      <div class="user">
        <NavigationList as |n|>
          <n.Item @href="/user/profile" @icon={{PhUser}}>Profile</n.Item>
          <n.Item @href="/user/sessions" @icon="{{PhClockClockwise}}">Sessions</n.Item>
        </NavigationList>

        {{outlet}}
      </div>
    </:content>
  </Page>
</template>
