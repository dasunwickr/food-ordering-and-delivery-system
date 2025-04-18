import { Schema, model, Document } from 'mongoose';

interface IAuth {
  userId: string;
  email: string;
  password: string;
}

const authSchema = new Schema<IAuth>({
  userId: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const AuthModel = model<IAuth>('Auth', authSchema);

export { AuthModel, IAuth };
