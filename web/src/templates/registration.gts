import * as v from 'valibot';

import { auth } from '#/auth';

import { type FieldValidationHandler, FocusPage, Form } from '@hokulea/ember';

const passwordSchema = v.pipe(
  v.optional(v.string(), ''),
  v.string(),
  v.minLength(8),
  v.regex(/[A-Z]/, 'upper'),
  v.regex(/[a-z]/, 'lower'),
  v.regex(/[0-9]/, 'number'),
  v.regex(/[^A-Za-z0-9]/, 'special')
);

interface RegistrationForm {
  email: string;
  name: string;
  password: string;
  confirm_password: string;
}

const validateConfirmPassword: FieldValidationHandler<RegistrationForm> = ({ value, form }) => {
  console.log('validateConfirmPassword', value, form.getFieldValue('password'));

  if (value !== form.getFieldValue('password')) {
    return 'Passwords must match';
  }

  return;
};

async function register(data: RegistrationForm) {
  const result = await auth.signUp.email(data);

  console.log(data, result);
}

<template>
  <FocusPage @title="Registration">
    <Form @submit={{register}} as |f|>
      <f.Text @name="name" @label="Name" />

      <f.Email @name="email" @label="Email" />

      <f.Password @name="password" @label="Password" @validate={{passwordSchema}} required>
        <:rules as |Rule|>
          <Rule @key="type" @value="min_length">must be at least 8 characters</Rule>
          <Rule @key="message" @value="upper">must contain at least one uppercase letter</Rule>
          <Rule @key="message" @value="lower">must contain at least one lowercase letter</Rule>
          <Rule @key="message" @value="number">must contain at least one number</Rule>
          <Rule @key="message" @value="special">must contain at least one special character</Rule>
        </:rules>
      </f.Password>
      <f.Password
        @name="confirm_password"
        @label="Confirm Password"
        @linkedField="password"
        @revalidateOn="input"
        @validate={{validateConfirmPassword}}
      />

      <f.Submit>Register</f.Submit>
    </Form>
  </FocusPage>
</template>
