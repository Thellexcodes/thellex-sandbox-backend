export enum FiatEndpoints {
  /**
   * Main base endpoint for the fiat wallet controller
   */
  MAIN = '/fiatwallet',

  /**
   * Create a fiat wallet profile for a user
   */
  CREATE_PROFILE = '/create-profile',

  /**
   * Create a fiat wallet for a user
   */
  CREATE_WALLET = '/create-wallet',

  /**
   * Start cron job for creating a fiat wallet profile
   */
  START_PROFILE_JOB = '/start-profile-job',

  /**
   * Start cron job for creating a fiat wallet
   */
  START_WALLET_JOB = '/start-wallet-job',

  /**
   * Stop all running cron jobs
   */
  STOP_ALL_JOBS = '/stop-all',

  /**
   * Get a user’s fiat wallet profile
   */
  GET_PROFILE = '/profile/:userId',

  /**
   * Get a user’s fiat wallet by country
   */
  GET_BY_COUNTRY = '/:userId/country/:country',

  /**
   * Get a user’s fiat wallet by ticker
   */
  GET_BY_TICKER = '/:userId/ticker/:ticker',

  /**
   * Get all fiat wallets
   */
  GET_ALL = '/all',

  /**
   * Get a single fiat wallet by wallet ID
   */
  GET_WALLET = '/:walletId',

  /**
   * Suspend a single fiat wallet
   */
  SUSPEND_ONE = '/suspend/:walletId',

  /**
   * Suspend multiple fiat wallets
   */
  SUSPEND_MANY = '/suspend-many',

  /**
   * Update a wallet (e.g., change status or details)
   */
  UPDATE_WALLET = '/update/:walletId',

  /**
   * Delete a wallet
   */
  DELETE_WALLET = '/delete/:walletId',
}
