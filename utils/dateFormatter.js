const formatDate = (date, timeZone = "Asia/Kolkata", shouldFormat = true) => {
  try {
    const d = new Date(date);
    if (!shouldFormat) {
      return d.toISOString();
    }

    const options = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone,
    };

    const formatted = d.toLocaleString("en-US", options);

    const [weekdayAndDate, timeStr] = formatted.split(" at ");
    const [weekday, month, day, year] = weekdayAndDate
      .split(/[,\s]+/)
      .filter(Boolean);
    const time = timeStr ? timeStr.trim() : "";

    return `${weekday}, ${month} ${day}, ${year} | ${time}`;
  } catch (error) {
    console.error(`Invalid timezone: ${timeZone}, falling back to IST`);
    return formatDate(date, "Asia/Kolkata", shouldFormat);
  }
};

module.exports = { formatDate };
