const net = require("net");
const requestIp = require("request-ip");

const getClientIpDetails = (req) => {
  // Get client IP using request-ip package
  const clientIp = requestIp.getClientIp(req);

  if (!clientIp) return { type: "unknown" };

  // Remove any prefix for IPv4-mapped IPv6 addresses
  const cleanIP = clientIp.replace(/^::ffff:/, "");

  // Check if it's a valid IPv4 address
  if (net.isIPv4(cleanIP)) {
    return {
      ipv4: cleanIP,
      ipv6: null,
      type: "ipv4",
    };
  }

  // Check if it's a valid IPv6 address
  if (net.isIPv6(clientIp)) {
    return {
      ipv4: null,
      ipv6: clientIp,
      type: "ipv6",
    };
  }

  // Return unknown if neither IPv4 nor IPv6
  return {
    ipv4: null,
    ipv6: null,
    type: "unknown",
  };
};

module.exports = { getClientIpDetails };
