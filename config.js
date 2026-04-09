/**
 * Medical Portfolio Configuration
 * Edit this file to customize all content across the portfolio
 */

const CONFIG = {
  // Site Info
  site: {
    name: "Dr. Sarah Mitchell",
    title: "Dr. Sarah Mitchell - Medical Professional",
    footerText: "© 2026 Dr. Sarah Mitchell. All rights reserved.",
    subtitle: "MD, Board Certified"
  },

  // Navigation
  navigation: [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "resume", label: "Resume" },
    { id: "cv", label: "CV" },
    { id: "contact", label: "Contact" }
  ],

  // Hero Section
  hero: {
    greeting: "Hello, I'm",
    typingTexts: [
      "Board Certified Physician",
      "Internal Medicine Specialist",
      "Patient Care Advocate",
      "Medical Researcher"
    ],
    description: "Dedicated physician with 12+ years of experience in internal medicine. Committed to providing compassionate, evidence-based care while advancing medical knowledge through research and teaching.",
    ctaButton: {
      text: "Book Consultation",
      action: "contact"
    }
  },

  // Social Links
  social: {
    facebook: "#",
    linkedin: "#",
    github: "#",
    twitter: "#"
  },

  // About Section
  about: {
    name: "Dr. Sarah Mitchell",
    email: "dr.sarah@medicalcenter.com",
    age: 42,
    location: "Boston, MA",
    specialty: "Internal Medicine",
    availability: "Accepting New Patients",
    description: "I am a board-certified internal medicine physician with over 12 years of clinical experience. My practice focuses on comprehensive patient care, preventive medicine, and chronic disease management. I believe in a holistic approach to healthcare that addresses both physical and emotional well-being.",
    cvUploadPage: "cv"
  },

  // Stats
  stats: [
    { value: 5000, label: "Patients Treated", suffix: "+" },
    { value: 12, label: "Years Experience", suffix: "+" },
    { value: 15, label: "Research Publications", suffix: "" },
    { value: 8, label: "Awards & Honors", suffix: "" }
  ],

  // Resume (Education & Experience)
  resume: {
    education: [
      {
        date: "2010 - 2014",
        title: "Residency in Internal Medicine",
        institution: "Massachusetts General Hospital",
        description: "Chief Resident. Focused on cardiovascular medicine and evidence-based practice."
      },
      {
        date: "2006 - 2010",
        title: "Doctor of Medicine (MD)",
        institution: "Harvard Medical School",
        description: "Graduated Magna Cum Laude. Alpha Omega Alpha Honor Society member."
      },
      {
        date: "2002 - 2006",
        title: "Bachelor of Science in Biology",
        institution: "Johns Hopkins University",
        description: "Pre-med track with research focus in molecular biology."
      }
    ],
    experience: [
      {
        date: "2019 - Present",
        title: "Attending Physician",
        institution: "Brigham and Women's Hospital",
        description: "Leading a team of residents and fellows. Specializing in complex internal medicine cases."
      },
      {
        date: "2014 - 2019",
        title: "Associate Physician",
        institution: "Boston Medical Center",
        description: "Provided comprehensive internal medicine care to diverse patient populations."
      },
      {
        date: "2012 - 2014",
        title: "Chief Resident",
        institution: "Massachusetts General Hospital",
        description: "Led residency program initiatives and mentored junior residents."
      }
    ]
  },

  // CV Section
  cv: {
    contact: {
      email: "dr.sarah@medicalcenter.com",
      phone: "+1 (617) 555-0123",
      location: "Boston, MA"
    },
    skills: [
      { name: "Internal Medicine", level: 98 },
      { name: "Patient Care & Diagnosis", level: 97 },
      { name: "Clinical Research", level: 90 },
      { name: "Electronic Health Records", level: 95 },
      { name: "Medical Teaching", level: 88 },
      { name: "Emergency Medicine", level: 82 }
    ],
    certifications: [
      { name: "Board Certified - Internal Medicine", status: "Active" },
      { name: "ACLS Certified", status: "Active" },
      { name: "DEA License", status: "Active" },
      { name: "BLS Certified", status: "Active" }
    ],
    memberships: [
      "🏥 American College of Physicians",
      "📋 American Medical Association",
      "🔬 Society of General Internal Medicine",
      "🎓 Association of American Medical Colleges"
    ]
  },

  // Contact Section
  contact: {
    email: "dr.sarah@medicalcenter.com",
    phone: "+1 (617) 555-0123",
    location: "Brigham and Women's Hospital, 75 Francis St, Boston, MA",
    clinicHours: "Mon-Fri: 8:00 AM - 5:00 PM",
    successMessage: "Message sent successfully! I'll respond within 24 hours. 🏥"
  },

  // File Upload Settings
  upload: {
    maxFiles: 10,
    allowedTypes: ["PDF", "DOC", "DOCX", "TXT", "RTF"],
    maxSize: "5 MB"
  },

  // Animation Settings
  animation: {
    typing: {
      initialSpeed: 100,
      deleteSpeed: 50,
      pauseAtEnd: 2000,
      pauseAtStart: 500
    },
    counters: {
      duration: 2500,
      startDelay: 500
    },
    skills: {
      staggerDelay: 200,
      startDelay: 500
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
