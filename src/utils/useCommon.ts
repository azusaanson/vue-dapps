export const shortAddress = (address: string) => {
  if (address === "") {
    return "";
  }

  return (
    address.substring(0, 6) +
    "..." +
    address.substring(address.length - 4, address.length)
  );
};

export const shortHash = (hash: string) => {
  if (hash === "") {
    return "";
  }

  return (
    hash.substring(0, 10) + "..." + hash.substring(hash.length - 8, hash.length)
  );
};

export const toDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-GB");
};
