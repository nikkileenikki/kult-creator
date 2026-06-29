import { betterAuth } from 'better-auth'

export function createAuth(env) {
  return betterAuth({
    basePath: '/api/creator-auth',
    database: env.DB,
    secret: env.BETTER_AUTH_SECRET ?? 'creator-dev-secret-change-in-production',
    emailAndPassword: { enabled: true },
    user: {
      modelName: 'ca_user',
      additionalFields: {
        creatorId: { type: 'string', required: false, input: false },
      },
    },
    session:      { modelName: 'ca_session' },
    account:      { modelName: 'ca_account' },
    verification: { modelName: 'ca_verification' },
    trustedOrigins: [
      'https://kult-creator.pages.dev',
      'https://*.kult-creator.pages.dev',
      'http://localhost:5173',
    ],
  })
}
