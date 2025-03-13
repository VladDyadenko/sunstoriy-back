import { GoogleGuard } from './google.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

export const GUARDS = [JwtAuthGuard, GoogleGuard];
