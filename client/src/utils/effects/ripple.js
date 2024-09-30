// utils/ripple.js
export const createRipple = (event, rippleEffect) => {
  const button = event.currentTarget;
  const ripple = document.createElement("span");
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  ripple.style.top = `${event.clientY - button.offsetTop - radius}px`;
  ripple.classList.add(rippleEffect.ripple);

  button.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
};
