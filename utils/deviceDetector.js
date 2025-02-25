const DeviceDetector = require("device-detector-js");
const detector = new DeviceDetector();

const getDefaultDeviceInfo = () => ({
  name: "Unknown Device",
  type: "Unknown",
  os: { name: "Unknown", version: null },
  client: { name: "Unknown", version: null, type: "Unknown" },
  brand: null,
  model: null,
});

const getDeviceInfo = (userAgent) => {
  if (!userAgent) {
    return getDefaultDeviceInfo();
  }

  try {
    const device = detector.parse(userAgent);

    // Handle special cases like Postman
    if (userAgent.includes("Postman")) {
      return {
        name: "Postman Desktop",
        type: "API Client",
        os: {
          name: device.os?.name || "Unknown",
          version: device.os?.version || null,
        },
        client: {
          name: "Postman",
          version: userAgent.split("/")[1] || "Unknown",
          type: "API Testing Tool",
        },
        brand: "Postman",
        model: "Desktop",
      };
    }

    // For regular devices
    return {
      name: formatDeviceName(device),
      type: device.device?.type || "Desktop",
      os: {
        name: device.os?.name || "Unknown",
        version: device.os?.version || null,
      },
      client: {
        name: device.client?.name || "Unknown",
        version: device.client?.version || null,
        type: device.client?.type || "browser",
      },
      brand: device.device?.brand || null,
      model: device.device?.model || null,
    };
  } catch (error) {
    console.error("Error detecting device:", error);
    return getDefaultDeviceInfo();
  }
};

const formatDeviceName = (device) => {
  if (!device) return "Unknown Device";

  const brand = device.device?.brand;
  const model = device.device?.model;
  const clientName = device.client?.name;
  const osName = device.os?.name;

  if (brand && model) {
    return `${brand} ${model}`.trim();
  }

  if (clientName && osName) {
    return `${clientName} on ${osName}`.trim();
  }

  if (osName) {
    return `${osName} Device`.trim();
  }

  return "Unknown Device";
};

module.exports = { getDeviceInfo };
