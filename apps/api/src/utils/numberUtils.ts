export function generateRandomFiveDigitNumber(): number {
  // Generates a random number between 10000 and 99999 (inclusive)
  return Math.floor(10000 + Math.random() * 90000);
}
