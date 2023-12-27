import { PickType } from '@nestjs/swagger';
import { User } from '../../user/user.entity';

export class RegisterWithEmailDto extends PickType(User, ['password', 'email', 'name', 'phone', 'address']) {}

export class RegisterWithUsernameDto extends PickType(User, ['password', 'username', 'name', 'phone', 'address']) {}
