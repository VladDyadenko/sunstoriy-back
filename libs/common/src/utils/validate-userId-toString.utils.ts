import { Types } from 'mongoose';

export const validateUserIdToString = (value: string | Types.ObjectId): string => {
   return typeof value === 'string' ? value : value.toHexString()
}