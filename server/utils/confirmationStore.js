const confirmationCodes = new Map();

const setConfirmationCode = (email, code) => {
  confirmationCodes.set(email, code);
  // Optionally add code to expire the code after a certain period
};

const getConfirmationCode = (email) => {
  return confirmationCodes.get(email);
};

module.exports = { setConfirmationCode, getConfirmationCode };
