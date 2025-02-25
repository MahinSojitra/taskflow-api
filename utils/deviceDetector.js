const DeviceDetector = require("device-detector-js");
const detector = new DeviceDetector();

const getDefaultDeviceInfo = () => ({
  name: "Generic Device",
  type: "Unknown Device Type",
  os: { name: "Unknown OS", version: "N/A" },
  client: {
    name: "Unknown Application",
    version: "N/A",
    type: "Unknown Client",
  },
  brand: "Unknown Brand",
  model: "Unknown Model",
});

const getDeviceInfo = (userAgent) => {
  if (!userAgent) {
    return getDefaultDeviceInfo();
  }

  try {
    const device = detector.parse(userAgent);

    const brand =
      device.device?.brand ||
      device.vendor ||
      extractBrand(userAgent) ||
      "Generic Brand";
    const model =
      device.device?.model || extractModel(userAgent) || "Generic Model";
    const osName = device.os?.name || extractOS(userAgent) || "Unknown OS";
    const osVersion = device.os?.version || "N/A";
    const clientName = device.client?.name || "Unknown Application";
    const clientVersion = device.client?.version || "N/A";
    const clientType = device.client?.type || "Unknown Client";
    const deviceType = device.device?.type || "Unknown Device Type";

    return {
      name: formatDeviceName(brand, model, osName),
      type: deviceType,
      os: {
        name: osName,
        version: osVersion,
      },
      client: {
        name: clientName,
        version: clientVersion,
        type: clientType,
      },
      brand: brand,
      model: model,
    };
  } catch (error) {
    console.error("Error detecting device:", error);
    return getDefaultDeviceInfo();
  }
};

const formatDeviceName = (brand, model, osName) => {
  if (brand !== "Generic Brand" && model !== "Generic Model")
    return `${brand} ${model}`.trim();
  if (osName !== "Unknown OS") return `${osName} Device`.trim();
  return "Generic Device";
};

const extractBrand = (userAgent) => {
  const knownBrands = [
    "Apple",
    "Samsung",
    "Google",
    "OnePlus",
    "Huawei",
    "Xiaomi",
    "Sony",
    "LG",
    "Nokia",
    "Motorola",
    "Asus",
    "HTC",
    "Lenovo",
    "Realme",
    "Oppo",
    "Vivo",
    "BlackBerry",
    "ZTE",
    "Alcatel",
    "Meizu",
    "Micromax",
    "Panasonic",
    "Sharp",
    "TCL",
    "Tecno",
    "Infinix",
    "Nothing",
    "Honor",
    "Fairphone",
    "Gionee",
    "Essential",
    "Coolpad",
    "LeEco",
    "Blu",
    "Poco",
    "iQOO",
    "Redmi",
  ];
  for (const brand of knownBrands) {
    if (userAgent.includes(brand)) return brand;
  }
  return "Generic Brand";
};

const extractModel = (userAgent) => {
  const match = userAgent.match(/\(([^;]+);/);
  return match ? match[1].split(" ").slice(1).join(" ") : "Generic Model";
};

const extractOS = (userAgent) => {
  const knownOS = [
    "Windows",
    "Mac OS",
    "Android",
    "iOS",
    "Linux",
    "Ubuntu",
    "Chrome OS",
  ];
  for (const os of knownOS) {
    if (userAgent.includes(os)) return os;
  }
  return "Unknown OS";
};

module.exports = { getDeviceInfo };
