import { createResumeTemplate } from './TemplateBase';
import { getTemplateThemeConfig } from './template-themes';

/** Build a PDF template React component from a template id. */
export function buildTemplateComponent(templateId) {
  const cfg = getTemplateThemeConfig(templateId);
  return createResumeTemplate({
    fonts: cfg.fonts,
    sectionTitles: cfg.sectionTitles,
    headerLayout: cfg.headerLayout,
    theme: cfg.theme,
  });
}
