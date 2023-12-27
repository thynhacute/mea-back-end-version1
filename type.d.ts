import { User as UserExtend } from './src/user/user.entity';

declare global {
    namespace Express {
        interface User extends UserExtend {}
    }
}
