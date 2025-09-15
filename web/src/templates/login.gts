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
