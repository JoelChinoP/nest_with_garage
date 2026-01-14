type EnvValue = string | number | boolean;
const getValue = <T extends EnvValue>(key: string, defaultValue?: T): T => {
  const value = process.env[key]?.trim();

  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`MISSING ENVIRONMENT VARIABLE { ${key} }`);
  }

  const type = typeof defaultValue as keyof typeof parsers;
  return (parsers[type] ? parsers[type](value, key) : value) as T;
};

// Parsers for different types
const parsers = {
  number: (v: string, k: string) => {
    const n = Number(v);
    if (isNaN(n)) throw new Error(`Invalid number: ${k}`);
    return n;
  },
  boolean: (v: string) => ['true', '1', 'yes'].includes(v.toLowerCase()),
  string: (v: string) => v,
};

export const str = (key: string, defaultValue?: string) => getValue<string>(key, defaultValue);
export const num = (key: string, defaultValue?: number) => getValue<number>(key, defaultValue);
export const bool = (key: string, defaultValue?: boolean) => getValue<boolean>(key, defaultValue);
