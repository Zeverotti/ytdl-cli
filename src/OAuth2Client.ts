import { google } from 'googleapis';
import { OAuth2Client as GoogleAuth2Client } from 'google-auth-library';
import http from 'http';
import catchCode from './utils/catchCode';
import Byteroo, { Container } from 'byteroo';

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

class OAuth2Client {
  private server?: http.Server;
  private oauth2Client?: GoogleAuth2Client;
  private storage: Container;
  constructor(storage: Byteroo) {
    this.storage = storage.getContainerSync('credentials');
  }
  authenticate(
    clientId?: string,
    clientSecret?: string
  ): Promise<GoogleAuth2Client> {
    return new Promise(async (resolve, reject) => {
      const _clientId =
        clientId || (this.storage.get('clientId') as string | undefined);
      const _clientSecret =
        clientSecret ||
        (this.storage.get('clientSecret') as string | undefined);
      const forceAuth = clientId && clientSecret ? true : false;

      if (!_clientId || !_clientSecret)
        throw 'Invalid clientId and/or clientSecret';

      this.server = await catchCode((code) => {
        this.server && this.server.close();
        if (!this.oauth2Client) return;
        this.oauth2Client.getToken(code, async (err: any, token: any) => {
          if (err) {
            console.log('Error while trying to retrieve access token', err);
            return;
          }
          if (!this.oauth2Client) return;
          this.oauth2Client.credentials = token;
          this.storage.set('token', token);
          this.storage.set('clientId', clientId);
          this.storage.set('clientSecret', clientSecret);
          await this.storage.commit();
          resolve(this.oauth2Client);
        });
      });
      const address = this.server.address();
      if (typeof address === 'string' || !address) return;
      this.oauth2Client = new google.auth.OAuth2(
        _clientId,
        _clientSecret,
        `http://localhost:${address.port}`
      );

      if (forceAuth) return this.getNewToken();

      this.oauth2Client.credentials = this.storage.get('token');
      await this.oauth2Client.getRequestHeaders();
      this.storage.set('token', this.oauth2Client.credentials);
      this.storage.set('clientId', _clientId);
      this.storage.set('clientSecret', _clientSecret);
      await this.storage.commit();
      this.server.close();
      if (!this.oauth2Client) return;

      resolve(this.oauth2Client);
    });
  }
  private async getNewToken() {
    if (!this.oauth2Client) return;
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
  }
}

export default OAuth2Client;
