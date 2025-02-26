const formatDate = (date, timeZone = "Asia/Kolkata") => {
  try {
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

    const formatted = new Date(date).toLocaleString("en-US", options);

    // Split into components
    const [weekdayAndDate, timeStr] = formatted.split(" at ");
    const [weekday, month, day, year] = weekdayAndDate
      .split(/[,\s]+/)
      .filter(Boolean);
    const time = timeStr ? timeStr.trim() : "";

    // Reconstruct in desired format
    return `${weekday}, ${month} ${day}, ${year} | ${time}`;
  } catch (error) {
    // Fallback to IST if timezone is invalid
    console.error(`Invalid timezone: ${timeZone}, falling back to IST`);
    return formatDate(date, "Asia/Kolkata");
  }
};

module.exports = { formatDate };
