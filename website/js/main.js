function setActiveNav(pageName) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  event.target.classList.add('active');
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

function submitContactForm(e) {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('contactName').value,
    email: document.getElementById('contactEmail').value,
    message: document.getElementById('contactMessage').value
  };

  console.log('Form submitted:', formData);
  alert('Thank you for your message! We will get back to you soon.');
  e.target.reset();
}

function subscribeNewsletter(e) {
  e.preventDefault();
  
  const email = document.getElementById('newsletterEmail').value;
  console.log('Newsletter subscription:', email);
  alert('Thank you for subscribing to our newsletter!');
  e.target.reset();
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('Website loaded successfully');
});
