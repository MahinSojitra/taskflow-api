const net = require("net");

const formatIpAddress = (ip) => {
  if (!ip) return { type: "unknown" };

  // Remove any prefix for IPv4-mapped IPv6 addresses
  const cleanIP = ip.replace(/^::ffff:/, "");

  // Check if it's a valid IPv4 address
  if (net.isIPv4(cleanIP)) {
    return {
      ipv4: cleanIP,
      ipv6: null,
      type: "ipv4",
    };
  }

  // Check if it's a valid IPv6 address
  if (net.isIPv6(ip)) {
    return {
      ipv4: null,
      ipv6: ip,
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

module.exports = { formatIpAddress };
