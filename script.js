/**
 * Medical Portfolio - Config-Driven Frontend
 * Handles navigation, animations, file uploads, and auth
 */

let authToken = null;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof CONFIG === 'undefined') {
    console.error('CONFIG not found. Ensure config.js loads before script.js');
    return;
  }
  initNavigation();
  initHero();
  initAbout();
  initResume();
  initCV();
  initContact();
  initUploadZones();
  loadUploadedFiles();
  initEventListeners();
});

// ========================
// NAVIGATION
// ========================
function initNavigation() {
  const navLinks = document.getElementById('navLinks');
  navLinks.innerHTML = CONFIG.navigation.map(item =>
    `<a href="#" class="nav-link ${item.id === 'home' ? 'active' : ''}" data-page="${item.id}" onclick="showPage('${item.id}')">${item.label}</a>`
  ).join('');
}

window.showPage = function(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${pageName}`);
  if (target) {
    target.classList.add('active');
    target.style.animation = 'none';
    target.offsetHeight; // Trigger reflow
    target.style.animation = '';
  }
  document.querySelectorAll('.nav-link').forEach(link =>
    link.classList.toggle('active', link.dataset.page === pageName)
  );
  document.getElementById('navLinks').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (pageName === 'about') setTimeout(animateCounters, CONFIG.animation.counters.startDelay);
  if (pageName === 'cv') setTimeout(animateSkillBars, CONFIG.animation.skills.startDelay);
  if (pageName === 'resume' || pageName === 'cv') setTimeout(loadUploadedFiles, 300);
};

window.toggleMenu = function() {
  document.getElementById('navLinks').classList.toggle('open');
};

// ========================
// HERO SECTION
// ========================
function initHero() {
  document.querySelector('.greeting').innerHTML = `${CONFIG.hero.greeting} <span class="green-text">${CONFIG.site.name}</span>`;
  document.querySelector('.description').textContent = CONFIG.hero.description;

  const ctaBtn = document.getElementById('heroCta');
  ctaBtn.textContent = CONFIG.hero.ctaButton.text;
  ctaBtn.setAttribute('onclick', `showPage('${CONFIG.hero.ctaButton.action}')`);

  // Social icons
  document.getElementById('socialIcons').innerHTML = Object.values(CONFIG.social)
    .map((url, i) => `<a href="${url}" class="social-icon"><i class="icon">${Object.keys(CONFIG.social)[i]}</i></a>`)
    .join('');

  startTypingEffect();
}

let textIndex = 0, charIndex = 0, isDeleting = false, typingSpeed = CONFIG.animation.typing.initialSpeed;

function startTypingEffect() {
  const el = document.getElementById('typedText');
  const current = CONFIG.hero.typingTexts[textIndex];
  if (isDeleting) {
    el.textContent = current.substring(0, charIndex - 1);
    charIndex--;
    typingSpeed = CONFIG.animation.typing.deleteSpeed;
  } else {
    el.textContent = current.substring(0, charIndex + 1);
    charIndex++;
    typingSpeed = CONFIG.animation.typing.initialSpeed;
  }
  if (!isDeleting && charIndex === current.length) {
    typingSpeed = CONFIG.animation.typing.pauseAtEnd;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % CONFIG.hero.typingTexts.length;
    typingSpeed = CONFIG.animation.typing.pauseAtStart;
  }
  setTimeout(startTypingEffect, typingSpeed);
}

// ========================
// ABOUT SECTION
// ========================
function initAbout() {
  const { name, email, age, location, specialty, availability, description, cvUploadPage } = CONFIG.about;
  document.getElementById('aboutDetails').innerHTML = `
    <div class="detail-row"><span class="detail-label">Name:</span><span class="detail-value">${name}</span></div>
    <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${email}</span></div>
    <div class="detail-row"><span class="detail-label">Age:</span><span class="detail-value">${age}</span></div>
    <div class="detail-row"><span class="detail-label">From:</span><span class="detail-value">${location}</span></div>
    <div class="detail-row"><span class="detail-label">Specialty:</span><span class="detail-value">${specialty}</span></div>
    <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value available">${availability}</span></div>
  `;
  document.getElementById('aboutText').textContent = description;

  const cvBtn = document.getElementById('aboutCvBtn');
  cvBtn.textContent = 'View My CV';
  cvBtn.setAttribute('onclick', `showPage('${cvUploadPage}')`);

  // Stats
  document.getElementById('statsSection').innerHTML = CONFIG.stats.map(s => `
    <div class="stat-card">
      <h3 class="stat-number" data-target="${s.value}">0</h3>
      <p class="stat-label">${s.label}</p>
    </div>
  `).join('');
}

let countersAnimated = false;
function animateCounters() {
  if (countersAnimated) return;
  countersAnimated = true;
  document.querySelectorAll('.stat-number').forEach(counter => {
    const target = parseInt(counter.dataset.target);
    const duration = CONFIG.animation.counters.duration;
    const step = target / (duration / 16);
    let current = 0;
    const stat = CONFIG.stats.find(s => s.value === target);
    const suffix = stat ? stat.suffix : '+';
    const update = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current).toLocaleString() + suffix;
        requestAnimationFrame(update);
      } else {
        counter.textContent = target.toLocaleString() + suffix;
      }
    };
    update();
  });
}

// ========================
// RESUME SECTION
// ========================
function initResume() {
  const createTimeline = (items) => items.map(item => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <span class="timeline-date">${item.date}</span>
        <h4>${item.title}</h4>
        <p class="timeline-school">${item.institution}</p>
        <p class="timeline-desc">${item.description}</p>
      </div>
    </div>
  `).join('');

  document.getElementById('educationTimeline').innerHTML = createTimeline(CONFIG.resume.education);
  document.getElementById('experienceTimeline').innerHTML = createTimeline(CONFIG.resume.experience);
}

// ========================
// CV SECTION
// ========================
function initCV() {
  const { contact, skills, certifications, memberships } = CONFIG.cv;
  document.getElementById('cvName').innerHTML = `${CONFIG.site.name.split(' ')[0]} <span class="green-text">${CONFIG.site.name.split(' ').slice(1).join(' ')}</span>`;
  document.getElementById('cvTitle').textContent = CONFIG.site.subtitle;

  document.getElementById('cvContact').innerHTML = `
    <div class="cv-contact-item"><span class="cv-icon">📧</span><span>${contact.email}</span></div>
    <div class="cv-contact-item"><span class="cv-icon">📱</span><span>${contact.phone}</span></div>
    <div class="cv-contact-item"><span class="cv-icon">📍</span><span>${contact.location}</span></div>
  `;

  document.getElementById('cvSkills').innerHTML = skills.map(s => `
    <div class="skill-item">
      <div class="skill-header"><span>${s.name}</span><span>${s.level}%</span></div>
      <div class="skill-bar"><div class="skill-fill" data-width="${s.level}"></div></div>
    </div>
  `).join('');

  document.getElementById('cvCertifications').innerHTML = certifications.map(c => `
    <div class="certification-item">
      <span>${c.name}</span>
      <span class="cert-status">${c.status}</span>
    </div>
  `).join('');

  document.getElementById('cvMemberships').innerHTML = memberships.map(m => `
    <div class="membership-item">${m}</div>
  `).join('');
}

let skillsAnimated = false;
function animateSkillBars() {
  if (skillsAnimated) return;
  skillsAnimated = true;
  document.querySelectorAll('.skill-fill').forEach((fill, i) => {
    setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, i * CONFIG.animation.skills.staggerDelay);
  });
}

window.printCV = function() { window.print(); };

// ========================
// CONTACT SECTION
// ========================
function initContact() {
  const { email, phone, location, clinicHours } = CONFIG.contact;
  document.getElementById('contactEmail').textContent = email;
  document.getElementById('contactPhone').textContent = phone;
  document.getElementById('contactLocation').textContent = location;
  document.getElementById('contactHours').textContent = clinicHours;

  document.getElementById('contactSocial').innerHTML = Object.values(CONFIG.social)
    .map((url, i) => `<a href="${url}" class="social-icon"><i class="icon">${Object.keys(CONFIG.social)[i]}</i></a>`)
    .join('');

  document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    showToast(CONFIG.contact.successMessage);
    this.reset();
  });
}

// ========================
// FILE UPLOAD SYSTEM
// ========================
function initUploadZones() {
  setupUploadZone('resumeUploadZone', 'resumeFileInput', 'resumes');
  setupUploadZone('cvUploadZone', 'cvFileInput', 'cvs');
}

function setupUploadZone(zoneId, inputId, fileType) {
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);

  if (!zone || !input) return;

  // Click to browse
  zone.addEventListener('click', () => input.click());
  input.addEventListener('change', (e) => handleFileUpload(e.target.files[0], fileType));

  // Drag and drop
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files[0], fileType);
  });
}

async function handleFileUpload(file, fileType) {
  if (!file) return;

  // Validate
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'];
  if (!allowedTypes.includes(file.type)) {
    showToast('Invalid file type. Please upload PDF, DOC, DOCX, TXT, or RTF.', 'error');
    return;
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast('File too large. Maximum size is 5MB.', 'error');
    return;
  }

  // Show progress
  const progressContainer = document.querySelector(`#${fileType === 'resumes' ? 'resumeUploadZone' : 'cvUploadZone'} .upload-progress`);
  if (progressContainer) {
    progressContainer.classList.add('active');
    progressContainer.innerHTML = `
      <div class="progress-bar-container"><div class="progress-bar" id="progressBar-${fileType}"></div></div>
      <p class="progress-text" id="progressText-${fileType}">Uploading...</p>
    `;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('originalName', file.name.replace(/\.[^.]+$/, ''));

  try {
    // Simulate upload progress
    if (progressContainer) {
      simulateProgress(fileType);
    }

    const response = await fetch(`/api/upload/${fileType}`, { method: 'POST', body: formData });
    const data = await response.json();

    if (response.ok) {
      showToast(`${fileType === 'resumes' ? 'Resume' : 'CV'} uploaded successfully! ✅`);
      loadUploadedFiles();
    } else {
      showToast(data.error || 'Upload failed', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  }
}

function simulateProgress(fileType) {
  let progress = 0;
  const bar = document.getElementById(`progressBar-${fileType}`);
  const text = document.getElementById(`progressText-${fileType}`);
  if (!bar) return;

  const interval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      text.textContent = 'Upload complete!';
    }
    bar.style.width = progress + '%';
  }, 200);
}

// Load uploaded files from server
async function loadUploadedFiles() {
  try {
    const response = await fetch('/api/files');
    if (!response.ok) return;
    const data = await response.json();

    renderFileList('resumes', data.resumes || []);
    renderFileList('cvs', data.cvs || []);
  } catch (error) {
    console.error('Failed to load files:', error);
  }
}

function renderFileList(type, files) {
  const listId = type === 'resumes' ? 'resumeFileList' : 'cvFileList';
  const container = document.getElementById(listId);
  if (!container) return;

  if (files.length === 0) {
    container.innerHTML = '<p class="no-files">No files uploaded yet. Drag & drop above to upload.</p>';
    return;
  }

  container.innerHTML = files.map(file => {
    const date = new Date(file.uploadedAt).toLocaleDateString();
    const sizeKB = (file.size / 1024).toFixed(1);
    const isOwner = authToken !== null;

    return `
      <div class="file-item" data-id="${file.id}">
        <div class="file-info">
          <span class="file-icon">📄</span>
          <div>
            <p class="file-name">${file.originalName}</p>
            <p class="file-size">${sizeKB} KB</p>
            <p class="file-date">Uploaded: ${date}</p>
          </div>
        </div>
        <div class="file-actions">
          <a href="${file.downloadUrl}" class="btn-primary btn-small" download>⬇️ Download</a>
          ${isOwner ? `<button class="btn-primary btn-small btn-danger" onclick="deleteFile('${type}', '${file.id}')">🗑️ Delete</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Delete file (owner only)
async function deleteFile(type, fileId) {
  if (!authToken) {
    openAuthModal();
    return;
  }

  if (!confirm('Are you sure you want to permanently delete this file?')) return;

  try {
    const response = await fetch(`/api/files/${type}/${fileId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();

    if (response.ok) {
      showToast('File deleted successfully');
      loadUploadedFiles();
    } else {
      showToast(data.error || 'Delete failed', 'error');
    }
  } catch (error) {
    showToast('Network error', 'error');
  }
}

// ========================
// AUTH SYSTEM
// ========================
window.openAuthModal = function() {
  document.getElementById('authModal').classList.add('active');
  document.getElementById('authPassword').value = '';
  document.getElementById('authPassword').focus();
};

window.closeAuthModal = function() {
  document.getElementById('authModal').classList.remove('active');
};

window.authenticate = async function() {
  const password = document.getElementById('authPassword').value;
  if (!password) {
    showToast('Please enter a password', 'error');
    return;
  }

  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await response.json();

    if (response.ok) {
      authToken = data.token;
      closeAuthModal();
      showToast('Authenticated as Owner! 🔓');
      loadUploadedFiles();
      showOwnerControls();
    } else {
      showToast(data.error || 'Invalid password', 'error');
    }
  } catch (error) {
    showToast('Authentication failed', 'error');
  }
};

function showOwnerControls() {
  document.querySelectorAll('.owner-controls').forEach(el => el.classList.add('active'));
  document.querySelectorAll('.auth-badge').forEach(el => {
    el.textContent = '🔓 Owner Mode Active';
    el.style.display = 'inline-block';
  });
}

// ========================
// TOAST NOTIFICATIONS
// ========================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show' + (type === 'error' ? ' error' : '');
  setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// ========================
// EVENT LISTENERS
// ========================
function initEventListeners() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('navLinks').classList.remove('open');
      closeAuthModal();
    }
  });

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.pageYOffset > 100) {
      navbar.style.background = 'rgba(10,10,10,0.95)';
      navbar.style.boxShadow = '0 5px 30px rgba(0,0,0,0.5)';
    } else {
      navbar.style.background = 'rgba(10,10,10,0.8)';
      navbar.style.boxShadow = 'none';
    }
  });

  // Auth input enter key
  document.getElementById('authPassword')?.addEventListener('keypress', e => {
    if (e.key === 'Enter') authenticate();
  });
}
