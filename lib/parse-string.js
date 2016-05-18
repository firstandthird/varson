module.exports = (str) => {
  if (typeof str === 'string') {
    if (str === '') {
      return '';
    }
    if (!isNaN(str)) {
      return parseFloat(str);
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
