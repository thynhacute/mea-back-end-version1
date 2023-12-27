import crypto from 'crypto';

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
        const randomIndex = crypto.randomBytes(1).readUInt8(0) % charactersLength;
        result += characters.charAt(randomIndex);
    }

    return result;
}
export const genUUID = (target, scope) => {
    const hashStatus = crypto.createHash('md5').update(`${target}@${scope}`, 'utf8').digest('hex');
    return `${hashStatus.substr(0, 8)}-${hashStatus.substr(8, 4)}-${hashStatus.substr(12, 4)}-${hashStatus.substr(
        16,
        4,
    )}-${hashStatus.substr(20, 12)}`;
};

export const getHashCodeCode = async () => {
    // Seed for the random number generator
    let seed = Date.now();

    //random delay time 0 - 0.5s

    //random delay
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, Math.floor(Math.random() * 500));
    });

    // Function to generate a seeded random number
    function seededRandom() {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Function to generate a random letter
    function getRandomLetter() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return alphabet[Math.floor(seededRandom() * alphabet.length)];
    }

    // Function to generate a random number
    function getRandomNumber() {
        return Math.floor(seededRandom() * 10);
    }

    // Generate the random string
    let randomString = '';
    for (let i = 0; i < 3; i++) {
        randomString += getRandomLetter();
    }
    randomString += '-';

    for (let i = 0; i < 5; i++) {
        randomString += getRandomNumber();
    }

    return randomString;
};

export const getSlugCode = async () => {
    // Seed for the random number generator
    let seed = Date.now();

    //random delay time 0 - 0.5s

    //random delay
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, Math.floor(Math.random() * 500));
    });

    // Function to generate a seeded random number
    function seededRandom() {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // Function to generate a random letter

    // Function to generate a random number
    function getRandomNumber() {
        return Math.floor(seededRandom() * 10);
    }

    // Generate the random string
    let randomString = '';

    for (let i = 0; i < 2; i++) {
        randomString += getRandomNumber();
    }

    return randomString;
};
