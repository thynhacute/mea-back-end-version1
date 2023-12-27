import { User, UserStatus } from '../../user/user.entity';

interface FakeDataType {
    lettersAndNumbers: string;
    lettersAndNumbersLowerCase: string;
    lettersLowerCase: string;
    letters: string;
    number: string;
}

const fakePattern: FakeDataType = {
    lettersAndNumbers: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    lettersAndNumbersLowerCase: 'abcdefghijklmnopqrstuvwxyz0123456789',
    lettersLowerCase: 'abcdefghijklmnopqrstuvwxyz',
    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    number: '0123456789',
};

export function fakeData(length: number, type: keyof FakeDataType = 'lettersAndNumbers') {
    let result = '';
    const characters = fakePattern[type];
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const fakeUser = () => {
    const user = new User();
    user.name = fakeData(10, 'lettersLowerCase');
    user.password = '123abcAbc';
    user.googleId = fakeData(10, 'lettersAndNumbersLowerCase');
    // user.role = UserRole.USER;
    user.phone = `+84${fakeData(9, 'number')}`;
    user.email = `${fakeData(10, 'lettersLowerCase')}@gmail.com`;
    user.status = UserStatus.ACTIVE;

    return user;
};

export const getFakeUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
