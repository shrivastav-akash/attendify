// Small validation helpers, matching the existing typeof-guard idiom.

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

// True for real numbers (also accepts numeric strings like "12"), no NaN/Infinity.
const isFiniteNumber = (v) => {
  if (typeof v === "string" && v.trim() !== "") v = Number(v);
  return typeof v === "number" && Number.isFinite(v);
};

const isIntInRange = (v, min, max) => {
  if (typeof v === "string" && v.trim() !== "") v = Number(v);
  return Number.isInteger(v) && v >= min && v <= max;
};

const isNumberInRange = (v, min, max) => {
  if (typeof v === "string" && v.trim() !== "") v = Number(v);
  return isFiniteNumber(v) && v >= min && v <= max;
};

module.exports = { isNonEmptyString, isFiniteNumber, isIntInRange, isNumberInRange };
