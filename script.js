// ===== Mobile menu toggle =====

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}


// ===== Scroll reveal animation =====

const revealElements = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
  revealElements.forEach((el) => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = 120;

    if (elementTop < windowHeight - revealPoint) {
      el.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);

// trigger once on load
revealOnScroll();