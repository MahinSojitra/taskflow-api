const express = require("express");
const cors = require("cors");
const path = require("path");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root route - Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Import API routes
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// AI-Powered Smart Route Suggestion
app.use((req, res, next) => {
  if (req.path === "/api") {
    return res.redirect("/");
  }

  const availableRoutes = [
    { method: "POST", path: "/api/users/signup" },
    { method: "POST", path: "/api/users/signin" },
    { method: "GET", path: "/api/users/profile" },
    { method: "PUT", path: "/api/users/profile" },
    { method: "POST", path: "/api/users/forgot-password" },
    { method: "POST", path: "/api/users/reset-password" },
    { method: "POST", path: "/api/users/refresh" },
    { method: "POST", path: "/api/users/signout" },
    { method: "POST", path: "/api/users/signout-all" },
    { method: "GET", path: "/api/users/sessions" },
    { method: "GET", path: "/api/users/all" },
    // Task routes
    { method: "GET", path: "/api/tasks" },
    { method: "POST", path: "/api/tasks" },
    { method: "GET", path: "/api/tasks/:id" },
    { method: "PUT", path: "/api/tasks/:id" },
    { method: "DELETE", path: "/api/tasks/:id" },
    { method: "GET", path: "/api/tasks/all" },
  ];

  const requestedPath = req.path.toLowerCase();
  const requestedMethod = req.method;

  // Find exact match
  const exactRoute = availableRoutes.find(
    (r) =>
      r.path.toLowerCase() === requestedPath && r.method === requestedMethod
  );

  if (exactRoute) {
    next();
    return;
  }

  // Intelligent route matching
  const similarRoutes = availableRoutes.filter((r) => {
    const routePath = r.path.toLowerCase();
    const pathSegments = requestedPath.split("/");
    const routeSegments = routePath.split("/");

    const similarity =
      routeSegments.filter((seg) =>
        pathSegments.some(
          (pathSeg) => pathSeg.includes(seg) || seg.includes(pathSeg)
        )
      ).length / Math.max(routeSegments.length, pathSegments.length);

    return similarity > 0.5;
  });

  if (similarRoutes.length > 0) {
    // Method validation
    const samePathDifferentMethod = similarRoutes.find(
      (r) => r.path.toLowerCase() === requestedPath
    );
    if (samePathDifferentMethod) {
      return res.status(405).json({
        success: false,
        message: `AI detected incorrect method. Use ${samePathDifferentMethod.method} instead of ${requestedMethod}`,
        smartSuggestion: {
          method: samePathDifferentMethod.method,
          path: samePathDifferentMethod.path,
        },
      });
    }

    // Smart categorization
    const groupedEndpoints = similarRoutes.reduce((acc, route) => {
      const category = route.path.split("/")[3];
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        method: route.method,
        path: route.path,
      });
      return acc;
    }, {});

    return res.status(404).json({
      success: false,
      message: `AI Analysis: Unable to locate ${requestedMethod} ${req.path}`,
      intelligentSuggestions: groupedEndpoints,
    });
  }

  // Comprehensive endpoint listing
  return res.status(404).json({
    success: false,
    message: `AI Assistant: Endpoint not found ${requestedMethod} ${req.path}`,
    aiAnalysis: {
      suggestion: "Available endpoints detected:",
      endpoints: availableRoutes.reduce((acc, route) => {
        const category = route.path.split("/")[3];
        if (!acc[category]) acc[category] = [];
        acc[category].push({
          method: route.method,
          path: route.path,
        });
        return acc;
      }, {}),
    },
  });
});

// ✅ Global Error Handler
app.use(errorHandler);

module.exports = app;
