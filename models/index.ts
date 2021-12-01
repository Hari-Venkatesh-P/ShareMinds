export interface OAuthCacheData {
  loginSecret: string;
  oauthToken: string;
  oauthTokenSecret: string;
}

export interface AccessTokenCacheData {
  accessToken: string;
  accessSecret: string;
  userId: string;
}

export interface UserData {
  userId: string;
}
