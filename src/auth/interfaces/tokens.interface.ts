import { IToken } from 'src/users/interface/users.interface';

export interface Tokens {
  accessToken: string;
  refreshToken: IToken;
}
