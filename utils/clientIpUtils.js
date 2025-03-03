const net = require("net");
const axios = require("axios");

const getLocationDetails = async (ip) => {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const data = response.data;

    if (data.status === "fail") {
      return {
        country: "Unknown Country",
        region: "Unknown Region",
        city: "Unknown City",
        latitude: 0,
        longitude: 0,
        status: "private",
      };
    }

    return {
      country: data.country || "Unknown Country",
      region: data.regionName || "Unknown Region",
      city: data.city || "Unknown City",
      latitude: data.lat || 0,
      longitude: data.lon || 0,
      status: "public",
    };
  } catch (error) {
    console.error("Error fetching location details:", error.message);
    return {
      country: "Unknown Country",
      region: "Unknown Region",
      city: "Unknown City",
      latitude: 0,
      longitude: 0,
      status: "error",
    };
  }
};

const getClientIpDetails = async (req) => {
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

  // Get location details
  const locationDetails = await getLocationDetails(cleanIp);

  return {
    address: cleanIp,
    type: ipType,
    location: locationDetails,
  };
};

module.exports = { getClientIpDetails };
