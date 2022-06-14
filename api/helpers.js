const collectValidationError = (error) =>
  error.details.map((e) => e.message).join(",");

const transformToLocalTime = (x) => (x + 10800) * 1000;

module.exports = {
  collectValidationError,
  transformToLocalTime,
};
