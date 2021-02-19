const getItemFromLocalStorage = key => {
  return localStorage.getItem(key);
};

const setItemToLocalStorage = (key, value) => {
  localStorage.setItem(key, value);
};

export const getItemsFromLocalStorage = (...keys) => {
  const ret = {};
  for (const key of keys) {
    ret[key] = getItemFromLocalStorage(key);
  }
  return ret;
};

export const setItemsToLocalStorage = obj => {
  for (const key of Object.keys(obj)) {
    setItemToLocalStorage(key, obj[key]);
  }
};
