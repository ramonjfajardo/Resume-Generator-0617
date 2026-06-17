/**
 * Visual themes for the 10 resume templates.
 * Each theme changes layout, section chrome, spacing, and accent (print-safe grayscale).
 * All templates use standard PDF fonts (Helvetica) for maximum ATS compatibility.
 */

import { RESUME_BODY_FONT, RESUME_TITLE_FONT } from '../resume-font-family';

const atsFont = { body: RESUME_BODY_FONT, title: RESUME_TITLE_FONT };

const baseFonts = {
  helvetica: atsFont,
};

export const TEMPLATE_THEMES = {
  Resume: {
    id: 'Resume',
    label: 'Classic (Default)',
    fonts: { ...baseFonts.helvetica, baseSize: 11, nameSize: 24 },
    headerLayout: 'center',
    theme: {
      accent: '#1a1a1a',
      headerStyle: 'standard',
      sectionStyle: 'underline',
      pagePadding: '15mm',
      nameLetterSpacing: 0,
      nameUppercase: false,
      sectionSpacing: 12,
      bullet: '•',
      companyItalic: true,
    },
    sectionTitles: {
      summary: 'Summary',
      skills: 'Skills',
      experience: 'Professional Experience',
      education: 'Education & Credentials',
    },
  },

  'Resume-Classic-Charcoal': {
    id: 'Resume-Classic-Charcoal',
    label: 'Classic Charcoal',
    fonts: { ...baseFonts.helvetica, baseSize: 10.5, nameSize: 26, sectionSize: 9.5 },
    headerLayout: 'center',
    theme: {
      accent: '#333333',
      headerStyle: 'double-rule',
      sectionStyle: 'double-underline',
      pagePadding: '18mm 16mm',
      nameLetterSpacing: 0.5,
      nameUppercase: false,
      sectionSpacing: 14,
      bullet: '•',
      companyItalic: true,
    },
    sectionTitles: {
      summary: 'Summary',
      skills: 'Skills',
      experience: 'Experience',
      education: 'Education',
    },
  },

  'Resume-Tech-Teal': {
    id: 'Resume-Tech-Teal',
    label: 'Tech Teal',
    fonts: { ...baseFonts.helvetica, baseSize: 10.5, nameSize: 22, contactSize: 9 },
    headerLayout: 'split',
    theme: {
      accent: '#2d6a6a',
      headerStyle: 'accent-bar',
      sectionStyle: 'left-bar',
      pagePadding: '14mm 16mm',
      nameLetterSpacing: 0,
      nameUppercase: false,
      sectionSpacing: 11,
      bullet: '▪',
      companyItalic: false,
    },
    sectionTitles: {
      summary: 'Summary',
      skills: 'Technical Skills',
      experience: 'Experience',
      education: 'Education',
    },
  },

  'Resume-Executive-Navy': {
    id: 'Resume-Executive-Navy',
    label: 'Executive Navy',
    fonts: { ...baseFonts.helvetica, baseSize: 10.5, nameSize: 28, sectionSize: 9 },
    headerLayout: 'center',
    theme: {
      accent: '#1e3a5f',
      headerStyle: 'banner',
      sectionStyle: 'spaced-caps',
      pagePadding: '12mm 16mm',
      nameLetterSpacing: 1,
      nameUppercase: true,
      sectionSpacing: 13,
      bullet: '•',
      companyItalic: true,
    },
    sectionTitles: {
      summary: 'Executive Summary',
      skills: 'Core Competencies',
      experience: 'Professional Experience',
      education: 'Education',
    },
  },

  'Resume-Corporate-Slate': {
    id: 'Resume-Corporate-Slate',
    label: 'Corporate Slate',
    fonts: { ...baseFonts.helvetica, baseSize: 11, nameSize: 24 },
    headerLayout: 'split',
    theme: {
      accent: '#4a5568',
      headerStyle: 'standard',
      sectionStyle: 'pill',
      pagePadding: '15mm',
      nameLetterSpacing: 0,
      nameUppercase: false,
      sectionSpacing: 12,
      bullet: '–',
      companyItalic: false,
    },
    sectionTitles: {
      summary: 'Summary',
      skills: 'Skills',
      experience: 'Experience',
      education: 'Education',
    },
  },

  'Resume-Bold-Emerald': {
    id: 'Resume-Bold-Emerald',
    label: 'Bold Emerald',
    fonts: { ...baseFonts.helvetica, baseSize: 11, nameSize: 32, titleSize: 12, sectionSize: 11 },
    headerLayout: 'center',
    theme: {
      accent: '#1a4d3e',
      headerStyle: 'bold-name',
      sectionStyle: 'thick-rule',
      pagePadding: '16mm',
      nameLetterSpacing: 0,
      nameUppercase: false,
      sectionSpacing: 14,
      bullet: '•',
      companyItalic: true,
    },
    sectionTitles: {
      summary: 'Summary',
      skills: 'Skills',
      experience: 'Experience',
      education: 'Education',
    },
  },

  'Resume-Academic-Purple': {
    id: 'Resume-Academic-Purple',
    label: 'Academic Purple',
    fonts: { ...baseFonts.helvetica, baseSize: 11, nameSize: 23, sectionSize: 10 },
    headerLayout: 'left',
    theme: {
      accent: '#4a3f6b',
      headerStyle: 'minimal',
      sectionStyle: 'labeled',
      pagePadding: '20mm 18mm',
      nameLetterSpacing: 0,
      nameUppercase: false,
      sectionSpacing: 15,
      bullet: '•',
      companyItalic: true,
      summaryItalic: true,
    },
    sectionTitles: {
      summary: 'Professional Summary',
      skills: 'Core Competencies',
      experience: 'Professional Experience',
      education: 'Education & Credentials',
    },
  },

  'Resume-Creative-Burgundy': {
    id: 'Resume-Creative-Burgundy',
    label: 'Creative Burgundy',
    fonts: { ...baseFonts.helvetica, baseSize: 11, nameSize: 26, titleSize: 12, sectionSize: 10 },
    headerLayout: 'center',
    theme: {
      accent: '#6b2d3c',
      headerStyle: 'creative-rule',
      sectionStyle: 'accent-mark',
      pagePadding: '15mm 16mm',
      nameLetterSpacing: 0.3,
      nameUppercase: false,
      sectionSpacing: 13,
      bullet: '•',
      companyItalic: true,
    },
    sectionTitles: {
      summary: 'Professional Summary',
      skills: 'Core Competencies',
      experience: 'Professional Experience',
      education: 'Education',
    },
  },

  'Resume-Modern-Green': {
    id: 'Resume-Modern-Green',
    label: 'Modern Green',
    fonts: { ...baseFonts.helvetica, baseSize: 10, nameSize: 20, contactSize: 8.5, sectionSize: 9.5 },
    headerLayout: 'split',
    theme: {
      accent: '#2f5d3a',
      headerStyle: 'compact',
      sectionStyle: 'minimal',
      pagePadding: '12mm 14mm',
      nameLetterSpacing: 0.5,
      nameUppercase: true,
      sectionSpacing: 9,
      bullet: '–',
      companyItalic: false,
      expDatesBelow: true,
    },
    sectionTitles: {
      summary: 'Summary',
      skills: 'Skills',
      experience: 'Experience',
      education: 'Education',
    },
  },

  'Resume-Consultant-Steel': {
    id: 'Resume-Consultant-Steel',
    label: 'Consultant Steel',
    fonts: { ...baseFonts.helvetica, baseSize: 10, nameSize: 22, contactSize: 8.5 },
    headerLayout: 'center',
    theme: {
      accent: '#5c6b7a',
      headerStyle: 'standard',
      sectionStyle: 'thin-rule',
      pagePadding: '14mm 17mm',
      nameLetterSpacing: 2,
      nameUppercase: true,
      sectionSpacing: 11,
      bullet: '•',
      companyItalic: false,
      sectionTitleSmallCaps: true,
    },
    sectionTitles: {
      summary: 'Executive Summary',
      skills: 'Core Competencies',
      experience: 'Professional Experience',
      education: 'Education',
    },
  },
};

export function getTemplateThemeConfig(templateId) {
  return TEMPLATE_THEMES[templateId] || TEMPLATE_THEMES.Resume;
}
