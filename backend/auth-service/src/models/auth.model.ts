import { Schema, model } from 'mongoose';

type UserType = 'ADMIN' | 'CUSTOMER' | 'DRIVER' | 'RESTAURANT';

interface IAuth {
  userId: string;
  email: string;
  password: string;
  userType: UserType;
}

const authSchema = new Schema<IAuth>({
  userId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, required: true, enum: ['ADMIN', 'CUSTOMER', 'DRIVER', 'RESTAURANT'] }, // Added userType
});

const AuthModel = model<IAuth>('Auth', authSchema);

export { AuthModel, IAuth, UserType };