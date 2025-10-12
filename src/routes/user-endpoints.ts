export enum UserEndpoints {
  /**
   * Main base endpoint for the user controller
   */
  MAIN = '/user',

  /**
   * Endpoint to create a new user or retrieve an access token
   */
  CREATE = '/access',

  /**
   * Endpoint to authenticate a verified user and log them in
   */
  AUTHENTICATE = '/authenticate',

  /**
   * Endpoint to verify a user (usually OTP or similar verification)
   */
  VERIFY = '/verify',

  /**
   * Endpoint to get all user transactions (paginated)
   */
  TRANSACTIONS = '/transactions',

  /**
   * Endpoint to get all user ramp transactions (on/off ramp)
   */
  RAMP_TRANSACTIONS = '/ramp_transactions',

  /**
   * Endpoint to get all user notifications (paginated)
   */
  NOTIFICATIONS = '/notifications',
}
