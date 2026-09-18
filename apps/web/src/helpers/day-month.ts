const pad = (n: number) => String(n).padStart(2, "0");

/** "05/09". Intl's vi-VN day+month renders "05-09" in some engines, so it's spelled out. */
export const formatDayMonth = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
