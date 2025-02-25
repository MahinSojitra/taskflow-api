const DeviceDetector = require("device-detector-js");
const detector = new DeviceDetector();

const getDeviceInfo = (userAgent) => {
  if (!userAgent) {
    return "Unknown Device";
  }

  try {
    const device = detector.parse(userAgent);
    let deviceInfo = "";

    // Get Device Type
    if (device.device) {
      // Get Brand and Model
      if (device.device.brand) {
        deviceInfo += device.device.brand;
        if (device.device.model) {
          deviceInfo += ` ${device.device.model}`;
        }
      }

      // Get Device Type
      if (device.device.type) {
        deviceInfo += ` (${device.device.type})`;
      }
    }

    // Get OS Info
    if (device.os && device.os.name) {
      deviceInfo += ` - ${device.os.name}`;
      if (device.os.version) {
        deviceInfo += ` ${device.os.version}`;
      }
    }

    // Get Browser Info
    if (device.client && device.client.name) {
      deviceInfo += ` - ${device.client.name}`;
      if (device.client.version) {
        deviceInfo += ` ${device.client.version}`;
      }
    }

    return deviceInfo.trim() || "Unknown Device";
  } catch (error) {
    console.error("Error detecting device:", error);
    return "Unknown Device";
  }
};

module.exports = { getDeviceInfo };
