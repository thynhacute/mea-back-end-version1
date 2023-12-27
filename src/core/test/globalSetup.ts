import * as dotenv from 'dotenv';
dotenv.config({
    path: `config/.env.${process.env.NODE_ENV}`,
});
import { NKConfig } from '../NKConfig';

const initTest = () => {
    console.log(NKConfig);
};

export default initTest;
