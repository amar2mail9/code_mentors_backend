// user id generated
export const userIDCreator = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


/**
 * Standardized API Response
 * @param {boolean} success - true/false
 * @param {string} message - Human readable message
 * @param {object} data - (Optional) Payload to return
 * @param {object} error - (Optional) Error details
 */
export const ApiResponse = (success = Boolean, message = null, data = null, error = null) => {
    return {
        success,
        message,
        data,
        error
    };
};

export const OTPGenerator = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
