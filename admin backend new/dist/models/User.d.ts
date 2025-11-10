import { Model } from 'mongoose';
import { IUser } from '../types';
interface UserModel extends Model<IUser> {
    findByEmail(email: string): Promise<IUser | null>;
}
declare const User: UserModel;
export default User;
//# sourceMappingURL=User.d.ts.map