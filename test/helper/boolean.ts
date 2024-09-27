export const toBoolean = (value: string): boolean | undefined => {
  return BOOLEANS[value.toLowerCase()];
};

export const toBooleanStrict = (value: string): boolean => {
  return toBoolean(value) ?? throwStrict(value);
};

const throwStrict = (value: string): never => {
  throw new Error(`Invalid boolean value "${value}". Supported values: "true", "false" (case insensitive)`);
};

const BOOLEANS: Record<string, boolean | undefined> = {
  true: true,
  false: false,
};
