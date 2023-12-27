import moment from 'moment';

const nkMoment = moment;

const today = () => {
    const today = new Date();
    // set time to 00:00:00
    today.setHours(0, 0, 0, 0);

    return today;
};

export { nkMoment, today };
