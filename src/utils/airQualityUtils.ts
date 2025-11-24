import { AIR_QUALITY_GRADES } from "../constants/messages";

export const getPm10Grade = (value: string): string => {
  const num = parseInt(value, 10);
  if (isNaN(num)) return AIR_QUALITY_GRADES.UNKNOWN;
  if (num <= 30) return AIR_QUALITY_GRADES.GOOD;
  if (num <= 80) return AIR_QUALITY_GRADES.NORMAL;
  if (num <= 150) return AIR_QUALITY_GRADES.BAD;
  return AIR_QUALITY_GRADES.VERY_BAD;
};
