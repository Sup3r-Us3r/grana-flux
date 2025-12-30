import { faker } from '@faker-js/faker/locale/pt_BR';

export function generateCpf(): string {
  const digits = Array.from({ length: 9 }, () =>
    faker.number.int({ min: 0, max: 9 }),
  );

  const calcDigit = (d: number[], w: number[]) => {
    const sum = d.reduce((acc, digit, i) => acc + digit * w[i], 0);
    const rem = sum % 11;

    return rem < 2 ? 0 : 11 - rem;
  };

  const d1 = calcDigit(digits, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calcDigit([...digits, d1], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);

  return [...digits, d1, d2].join('');
}
