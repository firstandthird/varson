module.exports = (str) => {
  if (typeof str === 'string') {
    if (str === '') {
      return '';
    }
    if (str === 'true') {
      return true;
    }
    if (str === 'false') {
      return false;
    }
  }
  return str;
};
