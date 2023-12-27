import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NKConfig, constant } from '../../core';

export async function generateToken(id: string, email: string) {
    const payload = { id, email };
    return jwt.sign(payload, NKConfig.JWT_SECRET_KEY);
}

export async function decodeToken<T extends Object>(token: string) {
    try {
        return jwt.verify(token, NKConfig.JWT_SECRET_KEY) as T;
    } catch (err) {
        return null;
    }
}

export async function decodedRawToken<T extends Object>(token: string) {
    try {
        return jwt.decode(token) as T;
    } catch (err) {
        return null;
    }
}

export async function hashPassword(password: string) {
    return bcrypt.hash(password, constant.SALT_ROUND);
}

export async function comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}
