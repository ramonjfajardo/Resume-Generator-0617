# Resume Generator

An intelligent, AI-powered resume generation application that creates ATS-optimized resumes tailored to specific job descriptions. Built with Next.js and React PDF, this application leverages advanced AI models to generate professional resumes with customizable templates.

## 🚀 Features

- **AI-Powered Resume Generation**: Uses Claude (Anthropic) or OpenAI GPT models to optimize resumes for ATS systems
- **Multiple Professional Templates**: 10 distinct resume templates with various styles (Tech, Corporate, Creative, Academic, etc.)
- **Profile Management**: Support for multiple candidate profiles with profile-specific templates and prompts
- **Dynamic Prompt System**: Customizable AI prompts per profile for specialized resume generation
- **Quick Copy Functionality**: One-click copy buttons for email, phone, address, LinkedIn, GitHub, and other profile details
- **Dark/Light Theme**: User-friendly theme switching
- **PDF Generation**: Server-side PDF generation using `@react-pdf/renderer`
- **ATS Optimization**: Specialized prompts designed to achieve 95-100% ATS scores by extracting domain keywords and optimizing content

## 🛠️ Technical Stack

### Frontend
- **Next.js 14.1.0** - React framework with server-side rendering and API routes
- **React 18.2.0** - UI library
- **React DOM 18.2.0** - DOM rendering
- **@react-pdf/renderer 3.4.4** - PDF generation using React components

### Backend & AI
- **@anthropic-ai/sdk 0.32.1** - Anthropic Claude API integration
- **openai 4.20.0** - OpenAI GPT API integration
- **Node.js 20.x** - Runtime environment

### Utilities
- **formidable 2.1.1** - Form data parsing
- **jsonc-parser 3.3.1** - JSON with comments parsing
- **nodemailer 7.0.11** - Email functionality
- **resend 6.5.2** - Email service integration

## 📁 Project Structure

```
US_bidder_Apply12_31/
├── src/
│   ├── pages/                     # Next.js routes and API handlers
│   │   ├── index.js
│   │   ├── [profile].js
│   │   ├── parse.js
│   │   ├── manual/
│   │   └── api/
│   └── lib/                       # Application logic
│       ├── ai-service.js
│       ├── models.js
│       ├── paths.js               # Data directory path helpers
│       ├── profile-template-mapping.js
│       ├── profile-utils.js
│       ├── profile-prompt.js
│       ├── resume-json.js
│       ├── pdf-render.js
│       └── pdf-templates/
├── data/
│   ├── resumes/                   # Profile JSON files
│   └── prompts/                   # AI prompt templates (.txt)
├── public/                        # Static assets
├── jsconfig.json                  # Path alias: @/* → src/*
├── next.config.js
├── package.json
├── render.yaml
└── README.md
```

## 🏗️ Architecture

### Core Components

#### 1. **Profile-Template Mapping System**
The `src/lib/profile-template-mapping.js` file maps profile slugs to:
- Resume name (JSON filename)
- Template ID (React PDF component)
- Prompt file name (AI prompt template)

```javascript
{
  "1": {
    resume: "James Davis",
    template: "Resume-Tech-Teal",
    prompt: "james-davis"
  }
}
```

#### 2. **AI Service Layer**
The `src/lib/ai-service.js` provides a unified interface for multiple AI providers:
- **Claude (Anthropic)**: Default provider with Claude Sonnet models
- **OpenAI**: GPT-4 and GPT-3.5 support
- Features: Retry logic, timeout handling, response normalization

#### 3. **PDF Template System**
- **TemplateBase.js**: Factory function that creates React PDF components from configuration
- **Individual Templates**: 10 specialized templates with unique styling
- **Template Registry**: Centralized template lookup system

#### 4. **Dynamic Prompt Loading**
- Prompts stored as `.txt` files in `data/prompts/`
- Variable substitution (e.g., `{{name}}`, `{{jobDescription}}`)
- Profile-specific prompts with fallback to default

### Data Flow

1. **User Input**: User enters profile ID (e.g., "1") on home page
2. **Profile Loading**: System loads profile configuration from `profile-template-mapping.js`
3. **Data Fetching**: Profile JSON data loaded from `data/resumes/`
4. **Job Description**: User provides job description on profile page
5. **AI Processing**:
   - Prompt loaded and variables injected
   - AI model called with profile data + job description
   - AI returns optimized resume content (JSON)
6. **PDF Generation**:
   - Resume data merged with AI-generated content
   - React PDF component rendered with selected template
   - PDF stream generated server-side
7. **Download**: PDF returned to user as downloadable file

## 🔧 Setup & Installation

### Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager
- API keys for AI providers (Anthropic and/or OpenAI)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Apply12_31
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Required: At least one AI provider API key
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional: Override default models
   ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
   OPENAI_MODEL=gpt-4-turbo-preview
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## 📖 Usage

### Basic Workflow

1. **Access Home Page**: Navigate to the root URL
2. **Enter Profile ID**: Type a numeric profile ID (e.g., "1", "2", "3")
3. **View Profile Page**: System loads the corresponding profile
4. **Copy Profile Info**: Use quick copy buttons for contact details
5. **Enter Job Description**: Paste the job description in the textarea
6. **Optional Company Name**: Add company name for custom filename
7. **Generate Resume**: Click "Generate Resume PDF" button
8. **Download PDF**: Resume PDF downloads automatically

### Profile Management

#### Adding a New Profile

1. **Create Profile JSON**: Add a new JSON file in `data/resumes/`
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "phone": "+1-234-567-8900",
     "location": "San Francisco, CA",
     "title": "Software Engineer",
     "experience": [...],
     "education": [...],
     "skills": {...}
   }
   ```

2. **Update Profile Mapping**: Add entry to `src/lib/profile-template-mapping.js`
   ```javascript
   "7": {
     resume: "John Doe",
     template: "Resume-Tech-Teal",
     prompt: "john-doe"
   }
   ```

3. **Create Prompt File** (Optional): Add `data/prompts/john-doe.txt` for custom prompts

#### Available Templates

- `Resume-Tech-Teal` - Modern tech-focused design
- `Resume-Modern-Green` - Clean, contemporary style
- `Resume-Creative-Burgundy` - Creative industry design
- `Resume-Bold-Emerald` - Bold, impactful layout
- `Resume-Corporate-Slate` - Professional corporate style
- `Resume-Executive-Navy` - Executive-level design
- `Resume-Classic-Charcoal` - Traditional, timeless layout
- `Resume-Consultant-Steel` - Consulting industry style
- `Resume-Academic-Purple` - Academic/research focused
- `Resume` - Default template

## 🔑 API Endpoints

### `POST /api/generate`
Generates a PDF resume based on profile and job description.

**Request Body:**
```json
{
  "profile": "1",
  "jd": "Job description text...",
  "companyName": "Company Name (optional)",
  "provider": "claude",
  "model": null
}
```

**Response:** PDF file download

### `GET /api/profiles`
Returns list of all available profiles.

### `GET /api/profiles/[id]`
Returns profile data for a specific profile ID.

### `GET /api/templates`
Returns list of available templates.

## 🎨 Customization

### Creating Custom Templates

1. Create a new template component in `src/lib/pdf-templates/templates/`
2. Use `createResumeTemplate` from `TemplateBase.js`:
   ```javascript
   import { createResumeTemplate } from '../TemplateBase';
   
   export const ResumeCustomTemplate = createResumeTemplate({
     primaryColor: '#your-color',
     secondaryColor: '#your-color',
     // ... other config options
   });
   ```
3. Register in `src/lib/pdf-templates/index.js`

### Customizing AI Prompts

1. Create a `.txt` file in `data/prompts/`
2. Use variables: `{{name}}`, `{{email}}`, `{{jobDescription}}`, etc.
3. Reference in `profile-template-mapping.js`

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes* | Anthropic API key for Claude |
| `OPENAI_API_KEY` | Yes* | OpenAI API key for GPT models |
| `ANTHROPIC_MODEL` | No | Override default Claude model |
| `OPENAI_MODEL` | No | Override default OpenAI model |

*At least one AI provider key is required

## 🚢 Deployment

The project includes `render.yaml` for deployment on Render.com. For other platforms:

1. Set environment variables
2. Run `npm run build`
3. Start with `npm start`
4. Ensure Node.js 20.x is available

## 📝 License

Private project - All rights reserved

## 🤝 Contributing

This is a private project. For questions or issues, please contact the project maintainer.

## 📞 Support

For technical issues or questions about the application, please refer to the codebase documentation or contact the development team.

---

**Built with ❤️ using Next.js, React PDF, and AI**
end