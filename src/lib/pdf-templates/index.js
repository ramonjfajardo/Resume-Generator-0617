import { TEMPLATE_THEMES } from './template-themes';
import { buildTemplateComponent } from './build-template';

const templateIds = Object.keys(TEMPLATE_THEMES);

const templates = Object.fromEntries(
  templateIds.map((id) => [id, buildTemplateComponent(id)])
);

const templateLoaders = Object.fromEntries(
  templateIds.map((id) => [id, () => Promise.resolve(templates[id])])
);

export const getTemplate = (templateId) => {
  const templateName = templateId || 'Resume';
  return templates[templateName] || templates.Resume;
};

/** Load only the template needed for this request (faster cold start in dev). */
export async function getTemplateAsync(templateId) {
  const templateName = templateId || 'Resume';
  const load = templateLoaders[templateName] || templateLoaders.Resume;
  return load();
}

export { TEMPLATE_THEMES };
export default templates;
