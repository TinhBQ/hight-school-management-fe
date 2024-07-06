export function getSchoolYear(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month >= 6) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}
