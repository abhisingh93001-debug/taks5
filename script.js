// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// CTA button alert
document.getElementById('ctaBtn').addEventListener('click', () => {
	alert('Thanks for visiting MySite!');
});

// Theme toggle (dark/light)
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const saved = localStorage.getItem('theme');
if (saved === 'light') root.classList.add('light');

themeToggle.addEventListener('click', () => {
	root.classList.toggle('light');
	localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
});

// Simple contact form handler (frontend only)
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const name = document.getElementById('name').value.trim();
	const email = document.getElementById('email').value.trim();
	const message = document.getElementById('message').value.trim();

	if (!name || !email || !message) {
		statusEl.textContent = 'Please fill all fields.';
		return;
	}
	statusEl.textContent = 'Sent! (Demo only — no backend connected)';
	form.reset();
});