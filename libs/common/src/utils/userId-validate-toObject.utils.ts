import { Types } from 'mongoose';

export function validateUserIdToObject(value: string | Types.ObjectId): Types.ObjectId {
     if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
        return Types.ObjectId.createFromHexString(value);
    } else if (value instanceof Types.ObjectId) {
        return value;
    } else {
        throw new Error('Invalid user._id');
    }

}
