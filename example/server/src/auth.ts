import { betterAuth } from 'better-auth';
import { openAPI } from 'better-auth/plugins';
// eslint-disable-next-line import-x/no-named-as-default
import Database from 'better-sqlite3';

export const auth = betterAuth({
  database: new Database('./sqlite.db'),
  trustedOrigins: ['http://localhost:4200'],
  emailAndPassword: {
    enabled: true
  },
  plugins: [openAPI()]
});
