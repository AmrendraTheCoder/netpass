// Cross-browser polyfill — normalize browser namespace
if (typeof globalThis.browser === "undefined") {
  globalThis.browser = chrome;
}

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const totalSlides = slides.length;
let current = 0;

function showSlide(index) {
  slides.forEach((s) => s.classList.remove("active"));
  dots.forEach((d) => d.classList.remove("active"));
  slides[index].classList.add("active");
  dots[index].classList.add("active");

  prevBtn.disabled = index === 0;

  if (index === totalSlides - 1) {
    nextBtn.innerHTML = `
      Done
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    `;
  } else {
    nextBtn.innerHTML = `
      Next
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
    `;
  }

  current = index;
}

nextBtn.addEventListener("click", () => {
  if (current < totalSlides - 1) {
    showSlide(current + 1);
  } else {
    // Mark onboarding as complete and close
    browser.storage.local.set({ onboardingDone: true }, () => {
      window.close();
    });
  }
});

prevBtn.addEventListener("click", () => {
  if (current > 0) {
    showSlide(current - 1);
  }
});

dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(parseInt(dot.dataset.index));
  });
});

// OS tab switching
document.querySelectorAll(".os-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".os-tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".os-content")
      .forEach((c) => c.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("os-" + tab.dataset.os).classList.add("active");
  });
});

// Apply theme
browser.storage.local.get(["theme"], ({ theme }) => {
  if (theme === "light") {
    document.body.classList.add("light");
  }
});
