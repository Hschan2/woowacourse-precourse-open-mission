export const getFormattedTime = (): string => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const timeOfDay = currentHour < 12 ? "오전" : "오후";
  const formattedHour = currentHour % 12 || 12;

  return `${timeOfDay} ${formattedHour}시 ${currentMinute}분`;
};
