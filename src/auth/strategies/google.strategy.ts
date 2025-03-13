import { AuthService } from '@auth/auth.service';
import googleOauthConfig from '@auth/config/google-oauth.config';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserResponse } from 'src/users/responses/user.response';
import { Provider } from 'src/users/user.models';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientID,
      clientSecret: googleConfiguration.clientSecret,
      callbackURL: googleConfiguration.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any,
    done: VerifyCallback,
  ) {
    const user = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      name: profile.name.givenName,
      avatarUrl: profile.photos[0].value,
      password: '',
      provider: Provider.GOOGLE,
    });
    // done(null, user);
    return new UserResponse(user);
  }
}
