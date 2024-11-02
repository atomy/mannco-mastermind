const getCountryCode = (countryCode: string) => {
  const countryCodeRemaps: Record<string, string> = {
    fx: 'FR',
  };
  const countryLower = countryCode.toLowerCase();

  return countryCodeRemaps[countryLower] || countryCode;
};

export default getCountryCode;
