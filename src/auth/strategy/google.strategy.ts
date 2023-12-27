import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { NKConfig } from '../../core/NKConfig';
import { UserService } from '../../user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly userService: UserService, private readonly authService: AuthService) {
        super({
            clientID: NKConfig.GOOGLE_CLIENT_ID,
            clientSecret: NKConfig.GOOGLE_SECRET,
            callbackURL: `${NKConfig.SERVER_URL}/api/v1.0/auth/google/callback`,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
        try {
            done(null, null);
        } catch (err) {
            done(err, null);
        }
    }
}
