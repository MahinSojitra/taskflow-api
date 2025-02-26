const net = require("net");

const getClientIpDetails = (req) => {
  // Get IP from various possible headers or connection
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    "Unknown";

  // Clean the IP address
  const cleanIp = ip.replace(/^::ffff:/, "");

  // Determine IP type
  const ipType =
    net.isIP(cleanIp) === 4
      ? "ipv4"
      : net.isIP(cleanIp) === 6
      ? "ipv6"
      : "unknown";

  return {
    address: cleanIp,
    type: ipType,
  };
};

module.exports = { getClientIpDetails };
