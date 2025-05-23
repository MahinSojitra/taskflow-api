const useragent = require("express-useragent");
const crypto = require("crypto");
const { getClientIpDetails } = require("./clientIpUtils");

const getDefaultDeviceInfo = () => ({
  id: generateFallbackDeviceId(),
  os: {
    name: "Unknown OS",
    version: "N/A",
  },
  client: {
    name: "Unknown Client",
    version: "N/A",
    type: "Unknown",
  },
  platform: "Unknown Platform",
  isBot: false,
});

const generateDeviceId = (deviceInfo, ipDetails) => {
  const uniqueString = JSON.stringify({
    browser: deviceInfo.client.name,
    browserVersion: deviceInfo.client.version,
    os: deviceInfo.os.name,
    osVersion: deviceInfo.os.version,
    platform: deviceInfo.platform,
    ip: ipDetails.address,
  });

  return crypto.createHash("sha256").update(uniqueString).digest("hex");
};

const generateFallbackDeviceId = () => {
  return crypto
    .createHash("sha256")
    .update(`fallback-${Date.now()}-${Math.random()}`)
    .digest("hex");
};

const getDeviceInfo = (req) => {
  const userAgent = req.headers["user-agent"];
  const ipDetails = getClientIpDetails(req);

  if (!userAgent) {
    const defaultInfo = getDefaultDeviceInfo();
    return {
      device: {
        ...defaultInfo,
        ip: ipDetails,
      },
    };
  }

  try {
    const ua = useragent.parse(userAgent);
    const userAgentLower = userAgent.toLowerCase();

    // Determine if it's an API client
    const isApiClient =
      userAgentLower.includes("postman") ||
      userAgentLower.includes("insomnia") ||
      userAgentLower.includes("curl");

    // Determine platform
    let platform = "Desktop";
    if (ua.isMobile) platform = "Mobile";
    else if (ua.isTablet) platform = "Tablet";
    else if (isApiClient) platform = "API Client";

    // Get browser name and type
    let browserName = ua.browser || "Unknown Client";
    let clientType = "browser";

    // Initialize OS details
    let osName = ua.os || "Unknown OS";
    let osVersion = "N/A";

    // Handle API clients
    if (isApiClient) {
      clientType = "api_client";
      // Set default Windows 10 for API clients
      osName = "Windows";
      osVersion = "10";

      if (userAgentLower.includes("postman")) browserName = "Postman";
      else if (userAgentLower.includes("insomnia")) browserName = "Insomnia";
      else if (userAgentLower.includes("curl")) browserName = "cURL";
    } else {
      if (ua.isChrome) browserName = "Chrome";
      else if (ua.isFirefox) browserName = "Firefox";
      else if (ua.isSafari) browserName = "Safari";
      else if (ua.isEdge) browserName = "Edge";
      else if (ua.isIE) browserName = "Internet Explorer";
      else if (ua.isOpera) browserName = "Opera";

      // Get OS details for non-API clients
      if (ua.isMac) {
        osName = "macOS";
        osVersion = ua.platform.includes("10_")
          ? `10.${ua.platform.split("10_")[1].split("_")[0]}`
          : ua.platform;
      } else if (ua.isWindows) {
        osName = "Windows";
        if (ua.platform.includes("Windows NT")) {
          const ntVersion = {
            "10.0": "10/11",
            6.3: "8.1",
            6.2: "8",
            6.1: "7",
            "6.0": "Vista",
            5.2: "Server 2003/XP x64",
            5.1: "XP",
            "5.0": "2000",
          };
          // Extract NT version from user agent string
          const ntMatch = userAgent.match(/Windows NT (\d+\.\d+)/);
          const ntNumber = ntMatch ? ntMatch[1] : null;
          osVersion = ntNumber ? ntVersion[ntNumber] || ntNumber : "N/A";
        } else {
          // Fallback to platform info if NT version not found
          osVersion = ua.platform.replace("Windows ", "");
        }
      } else if (ua.isLinux) {
        osName = "Linux";
        if (ua.platform.includes("Android")) {
          osName = "Android";
          osVersion = ua.platform.split("Android ")[1]?.split(";")[0] || "N/A";
        }
      } else if (ua.isiPad || ua.isiPhone || ua.isiPod) {
        osName = "iOS";
        const match = ua.platform.match(/OS (\d+_\d+)/);
        osVersion = match ? match[1].replace("_", ".") : "N/A";
      }
    }

    const deviceInfo = {
      device: {
        os: {
          name: String(osName),
          version: String(osVersion || "N/A"),
        },
        client: {
          name: String(browserName),
          version: String(ua.version || "N/A"),
          type: String(clientType),
        },
        platform: String(platform),
        isBot: Boolean(ua.isBot && !isApiClient), // API clients are not bots
        ip: ipDetails,
      },
    };

    // Generate and add device ID
    deviceInfo.device.id = generateDeviceId(deviceInfo.device, ipDetails);

    return deviceInfo;
  } catch (error) {
    console.error("Error detecting device:", error);
    const defaultInfo = getDefaultDeviceInfo();
    return {
      device: {
        ...defaultInfo,
        ip: ipDetails,
      },
    };
  }
};

module.exports = { getDeviceInfo };
