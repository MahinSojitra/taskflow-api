class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.icon = this.themeToggle.querySelector("i");
    this.init();
  }

  init() {
    // Remove theme-pending class to show content
    document.body.classList.remove("theme-pending");

    // Check for saved theme preference
    this.loadSavedTheme();

    // Add click event listener
    this.themeToggle.addEventListener("click", () => this.toggleTheme());

    // Add keyboard accessibility
    this.themeToggle.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode");
      this.icon.classList.replace("bi-sun-fill", "bi-moon-fill");
    }

    // Add transition class after initial load
    requestAnimationFrame(() => {
      document.body.classList.add("theme-transition");
    });
  }

  toggleTheme() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      this.icon.classList.replace("bi-sun-fill", "bi-moon-fill");
      localStorage.setItem("theme", "dark");
    } else {
      this.icon.classList.replace("bi-moon-fill", "bi-sun-fill");
      localStorage.setItem("theme", "light");
    }

    // Add animation class
    this.icon.classList.add("theme-icon-rotate");
    setTimeout(() => {
      this.icon.classList.remove("theme-icon-rotate");
    }, 500);
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
});

// Fallback to ensure content is shown
window.onload = () => {
  document.body.classList.remove("theme-pending");
};

// Add this function at the end of the file
function copyToClipboard(button, text) {
  navigator.clipboard.writeText(text).then(() => {
    const icon = button.querySelector("i");

    // Change icon to checkmark
    icon.classList.replace("bi-clipboard", "bi-clipboard-check-fill");
    button.classList.add("btn-copy-success");

    // Reset after 1.5 seconds
    setTimeout(() => {
      icon.classList.replace("bi-clipboard-check-fill", "bi-clipboard");
      button.classList.remove("btn-copy-success");
    }, 1500);
  });
}
