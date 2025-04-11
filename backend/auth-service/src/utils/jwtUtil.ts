import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
    [key: string]: any;
}

const jwtSecret: string = process.env.JWT_SECRET ?? (() => {
    throw new Error('Environment variable JWT_SECRET is not defined.');
})();

export const signToken = (payload: TokenPayload, expiresIn: string = '1d'): string => {
    const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
    return jwt.sign(payload, jwtSecret as jwt.Secret, options);
};

export const verifyToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, jwtSecret as jwt.Secret);
        return decoded as TokenPayload;
    } catch (err) {
        throw new Error('Invalid or expired token.');
    }
};
