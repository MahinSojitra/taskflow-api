class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.icon = this.themeToggle.querySelector("i");
    this.tooltips = [];
    this.init();
  }

  init() {
    // Initialize tooltips
    this.initializeTooltips();

    // Remove theme-pending class
    document.body.classList.remove("theme-pending");

    // Check for saved theme or use system preference
    this.loadSavedTheme();

    // Add click event listener
    this.themeToggle.addEventListener("click", () => this.toggleTheme());
  }

  getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem("theme");
    const systemTheme = this.getSystemTheme();

    // Use saved theme if exists, otherwise use system theme
    const themeToUse = savedTheme || systemTheme;

    if (themeToUse === "dark") {
      document.body.classList.add("dark-mode");
      this.icon.classList.replace("bi-sun-fill", "bi-moon-fill");
      this.themeToggle.setAttribute("data-bs-title", "Switch to Light Mode");
    } else {
      this.themeToggle.setAttribute("data-bs-title", "Switch to Dark Mode");
    }

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          // Only update if user hasn't set a preference
          if (e.matches) {
            document.body.classList.add("dark-mode");
            this.icon.classList.replace("bi-sun-fill", "bi-moon-fill");
            this.themeToggle.setAttribute(
              "data-bs-title",
              "Switch to Light Mode"
            );
          } else {
            document.body.classList.remove("dark-mode");
            this.icon.classList.replace("bi-moon-fill", "bi-sun-fill");
            this.themeToggle.setAttribute(
              "data-bs-title",
              "Switch to Dark Mode"
            );
          }
          this.initializeTooltips();
        }
      });

    this.initializeTooltips();

    // Add transition class after initial load
    requestAnimationFrame(() => {
      document.body.classList.add("theme-transition");
    });
  }

  toggleTheme() {
    document.body.classList.toggle("dark-mode");

    const isDarkMode = document.body.classList.contains("dark-mode");

    // Update theme toggle
    if (isDarkMode) {
      this.icon.classList.replace("bi-sun-fill", "bi-moon-fill");
      localStorage.setItem("theme", "dark");
      this.themeToggle.setAttribute("data-bs-title", "Switch to Light Mode");
    } else {
      this.icon.classList.replace("bi-moon-fill", "bi-sun-fill");
      localStorage.setItem("theme", "light");
      this.themeToggle.setAttribute("data-bs-title", "Switch to Dark Mode");
    }

    // Reinitialize tooltips with new theme
    this.initializeTooltips();

    // Animate icon
    this.icon.classList.add("theme-icon-rotate");
    setTimeout(() => {
      this.icon.classList.remove("theme-icon-rotate");
    }, 500);
  }

  initializeTooltips() {
    // Dispose existing tooltips
    this.disposeTooltips();

    // Initialize new tooltips
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    this.tooltips = [...tooltipTriggerList].map(
      (el) =>
        new bootstrap.Tooltip(el, {
          trigger: "hover focus",
          animation: true,
          delay: { show: 100, hide: 100 },
        })
    );
  }

  disposeTooltips() {
    this.tooltips.forEach((tooltip) => {
      if (tooltip) tooltip.dispose();
    });
    this.tooltips = [];
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
});

// Fallback to ensure content is shown
window.onload = () => {
  document.body.classList.remove("theme-pending");
};

// Copy to clipboard function with tooltip update
function copyToClipboard(button, text) {
  navigator.clipboard.writeText(text).then(() => {
    const icon = button.querySelector("i");

    // Change icon and add success class
    icon.classList.replace("bi-clipboard", "bi-clipboard-check-fill");
    button.classList.add("btn-copy-success");

    // Update tooltip
    button.setAttribute("data-bs-title", "Copied!");
    button.setAttribute("disabled", "disabled");

    // Reinitialize tooltip
    const tooltip = bootstrap.Tooltip.getInstance(button);
    if (tooltip) tooltip.dispose();
    const newTooltip = new bootstrap.Tooltip(button, {
      trigger: "manual",
      animation: true,
    });
    newTooltip.show();

    // Reset after 1.5 seconds
    setTimeout(() => {
      button.removeAttribute("disabled");
      icon.classList.replace("bi-clipboard-check-fill", "bi-clipboard");
      button.classList.remove("btn-copy-success");
      button.setAttribute("data-bs-title", "Copy to clipboard");
      newTooltip.dispose();
      new bootstrap.Tooltip(button, {
        trigger: "hover focus",
        animation: true,
      });
    }, 4000);
  });
}

// Tab icon toggle
document.querySelectorAll('[data-bs-toggle="tab"]').forEach((tab) => {
  tab.addEventListener("show.bs.tab", (event) => {
    // Remove fill from all icons
    document.querySelectorAll(".nav-link i").forEach((icon) => {
      icon.className = icon.className.replace("-fill", "");
    });

    // Add fill to active tab icon
    const icon = event.target.querySelector("i");
    if (icon) {
      if (event.target.id === "users-tab") {
        icon.classList.replace("bi-people", "bi-people-fill");
      } else if (event.target.id === "tasks-tab") {
        icon.classList.replace(
          "bi-journal-bookmark",
          "bi-journal-bookmark-fill"
        );
      } else if (event.target.id === "admin-tab") {
        icon.classList.replace("bi-person-badge", "bi-person-badge-fill");
      }
    }
  });
});
