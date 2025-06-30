export function parseQuantity(quantity: string): {
  amount: number;
  unit: string;
  fraction?: string;
} {
  // Handle fractions and mixed numbers
  const fractionMatch = quantity.match(/(\d+)?\s*(\d+)\/(\d+)/);
  const decimalMatch = quantity.match(/(\d+\.?\d*)/);
  const unitMatch = quantity.match(/([a-zA-Z]+)/);

  let amount = 0;
  if (fractionMatch) {
    const whole = fractionMatch[1] ? parseInt(fractionMatch[1]) : 0;
    const numerator = parseInt(fractionMatch[2]);
    const denominator = parseInt(fractionMatch[3]);
    amount = whole + numerator / denominator;
  } else if (decimalMatch) {
    amount = parseFloat(decimalMatch[1]);
  }

  const unit = unitMatch ? unitMatch[1] : "";

  return {
    amount,
    unit,
    fraction: fractionMatch ? fractionMatch[0] : undefined,
  };
}

export function scaleQuantity(quantity: string, scale: number): string {
  const parsed = parseQuantity(quantity);
  if (parsed.amount === 0) return quantity;

  const scaledAmount = parsed.amount * scale;

  // Convert back to fraction if it was originally a fraction
  if (parsed.fraction && scale < 2) {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const denominator = 16; // Common cooking denominator
    const numerator = Math.round(scaledAmount * denominator);
    const whole = Math.floor(numerator / denominator);
    const remainder = numerator % denominator;

    if (remainder === 0) {
      return whole > 0 ? `${whole} ${parsed.unit}`.trim() : `${parsed.unit}`;
    } else {
      const commonDivisor = gcd(remainder, denominator);
      const simplifiedNum = remainder / commonDivisor;
      const simplifiedDen = denominator / commonDivisor;

      if (whole > 0) {
        return `${whole} ${simplifiedNum}/${simplifiedDen} ${parsed.unit}`.trim();
      } else {
        return `${simplifiedNum}/${simplifiedDen} ${parsed.unit}`.trim();
      }
    }
  }

  // Round to reasonable precision
  const rounded = Math.round(scaledAmount * 100) / 100;
  return `${rounded} ${parsed.unit}`.trim();
}

export function extractTimeFromInstruction(instruction: string): number | null {
  const timeMatches = instruction.match(
    /(\d+)\s*(minutes?|mins?|hours?|hrs?)/i
  );
  if (!timeMatches) return null;

  const value = parseInt(timeMatches[1]);
  const unit = timeMatches[2].toLowerCase();

  if (unit.includes("hour") || unit.includes("hr")) {
    return value * 60;
  }
  return value;
}
