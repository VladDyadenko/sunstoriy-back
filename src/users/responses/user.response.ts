import { Exclude } from 'class-transformer';
import { Types } from 'mongoose';
import { Provider, User } from '../user.models';

export class UserResponse implements Partial<User> {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  lessons: string[];
  children: string[];

  @Exclude()
  password: string;

  @Exclude()
  token: string;

  @Exclude()
  provider: Provider;

  constructor(user: User) {
    // Перевіряємо, чи user._id є коректним ObjectId
    if (typeof user._id === 'string' && Types.ObjectId.isValid(user._id)) {
      this._id = user._id; // Якщо це коректний ObjectId у вигляді рядка
    } else if ((user._id as Types.ObjectId) instanceof Types.ObjectId) {
      this._id = user._id.toHexString(); // Якщо це об'єкт ObjectId
    } else {
      throw new Error('Invalid user._id'); // Якщо user._id некоректний
    }
    this.avatarUrl = user.avatarUrl;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.lessons = user.lessons?.map((lesson) =>
      typeof lesson === 'string'
        ? lesson
        : (lesson as Types.ObjectId).toHexString(),
    );
    this.children = user.children.map((child) =>
      typeof child === 'string'
        ? child
        : (child as Types.ObjectId).toHexString(),
    );
  }
}
