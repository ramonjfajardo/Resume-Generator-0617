/** Sample resume body used for template previews (no AI generation). */

export const PREVIEW_MOCK_RESUME = {
  summary:
    "Senior Software Engineer with 8+ years building scalable web applications and cloud infrastructure. Expertise in <strong>React.js</strong>, <strong>Node.js</strong>, and <strong>AWS</strong> with proven track record delivering high-performance solutions for enterprise clients.",
  skills: {
    Frontend: [
      "React.js",
      "Next.js",
      "TypeScript",
      "JavaScript",
      "Tailwind CSS",
    ],
    Backend: ["Node.js", "Express.js", "Python", "GraphQL", "REST APIs"],
    "Cloud & DevOps": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
  },
  experience: [
    {
      title: "Senior Software Engineer",
      details: [
        "Architected <strong>microservices</strong> using <strong>Node.js</strong> and <strong>React.js</strong>, serving 2M+ users with 99.9% uptime.",
        "Led migration to <strong>AWS</strong> with <strong>Docker</strong> and <strong>Kubernetes</strong>, reducing costs by 35%.",
        "Implemented <strong>CI/CD pipelines</strong> automating testing and deployment for 15+ services.",
        "Designed <strong>RESTful APIs</strong> processing 10M+ requests daily with sub-100ms latency.",
      ],
    },
    {
      title: "Software Engineer",
      details: [
        "Developed full-stack apps with <strong>React.js</strong>, <strong>Node.js</strong>, and <strong>PostgreSQL</strong>.",
        "Built responsive UIs with <strong>TypeScript</strong> and <strong>Tailwind CSS</strong>.",
        "Created test suites with <strong>Jest</strong> and <strong>Cypress</strong>, achieving 85% coverage.",
      ],
    },
    {
      title: "Junior Software Engineer",
      details: [
        "Maintained web applications using <strong>JavaScript</strong>, <strong>Python</strong>, and <strong>MySQL</strong>.",
        "Collaborated on features and fixes through code review and <strong>Agile</strong> delivery.",
      ],
    },
  ],
};

/** Fit mock bullets to the profile's job count (reuses entries when needed). */
export function mockResumeContentForExperienceCount(count) {
  const n = Math.max(1, count || 1);
  const pool = PREVIEW_MOCK_RESUME.experience;
  const experience = Array.from({ length: n }, (_, i) => {
    const sample = pool[i % pool.length];
    return {
      title: sample.title,
      details: [...sample.details],
    };
  });
  return {
    summary: PREVIEW_MOCK_RESUME.summary,
    skills: PREVIEW_MOCK_RESUME.skills,
    experience,
  };
}
