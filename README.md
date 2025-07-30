# 🧠 KulturalMente

**"Your Mind. Your Culture. Your Story."**

> An AI-powered cultural intelligence platform that discovers your unique cultural identity by analyzing your preferences across music, movies, food, travel, and literature. Built for the Qloo LLM Hackathon 2025.

![KulturalMente Banner](/public/KulturalMenteBanner.png)

## 🌟 What Makes KulturalMente Special?

Ever wondered why you love certain music, movies, or travel destinations? KulturalMente doesn't just track what you like—it discovers **WHY** you like it and reveals the deeper cultural story these preferences tell about who you are.

**The Problem:** We live in a world of scattered cultural preferences with no way to understand the deeper connections between them.

**Our Solution:** KulturalMente combines Qloo's powerful cultural intelligence with advanced language models to transform scattered preferences into meaningful cultural narratives and personalized discoveries.

## ✨ Key Features

### 🎯 Cultural DNA Discovery

- **5-Domain Analysis:** Music, Movies & TV, Food & Dining, Travel & Places, Books & Literature
- **Smart Search:** Qloo-powered auto-suggestions with popularity ratings
- **Real-time Progress:** Track your cultural profile building across domains

### 🧬 AI-Powered Analysis

- **Cross-Domain Connections:** Discover hidden relationships between your preferences (Music ↔ Movies: 95% strength)
- **Cultural Narrative Generation:** 4-chapter AI stories explaining WHY your preferences connect
- **Personality Insights:** Deep cultural patterns revealed through advanced LLM analysis

### 🔮 Predictive Intelligence

- **24-Month Evolution:** Predict how your cultural tastes will develop over time
- **Growth Challenges:** Personalized recommendations to expand your cultural horizons
- **Blind Spot Detection:** Identify unexplored cultural territories

### 🌍 Interactive Visualization

- **3D Cultural Constellation:** Explore your cultural universe in interactive 3D space
- **Journey Mapping:** Visualize connections between cultural preferences
- **Cultural DNA Explorer:** Navigate your cultural identity like never before

### 📊 Professional Export

- **Multiple Report Formats:** Executive Summary, Detailed Analysis, Technical Report
- **Real-time PDF Generation:** Professional cultural intelligence documents
- **Social Sharing:** Beautiful cultural DNA cards for social media

## 🛠️ Complete Technology Stack

### **🎯 Required Hackathon Technologies**

- **Qloo Taste AI™ API** - Cultural intelligence, cross-domain affinities, privacy-first data
- **OpenAI GPT-4o** - Large Language Model for cultural narrative generation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Qloo API credentials
- OpenAI API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/ajitonelsonn/kulturalmente.git
cd kulturalmente
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

```env
QLOO_API_URL=https://api.qloo.com
QLOO_API_KEY=your_qloo_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_NAME=KulturalMente
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see KulturalMente in action!

## 🏗️ Architecture Overview

### Core Services

#### Qloo Integration (`qloo-service.ts`)

- **Search API:** Real-time cultural entity search across domains
- **Similar API:** Find related cultural items using Qloo's intelligence
- **Recommendations API:** Generate personalized cultural suggestions
- **Enhanced Search:** Advanced filtering and popularity scoring

#### AI Narrative Engine (`server-openai-service.ts`)

- **Cultural Story Generation:** Creates meaningful narratives from preferences
- **Cross-Domain Analysis:** Identifies patterns across cultural domains
- **Evolution Predictions:** Forecasts future cultural development
- **Growth Challenges:** Generates personalized expansion opportunities

#### Cultural Analysis Pipeline

1. **Preference Collection:** User inputs across 5 cultural domains
2. **Qloo Processing:** Cross-domain entity mapping and relationship analysis
3. **LLM Enhancement:** Narrative generation and insight extraction
4. **Visualization:** 3D rendering and interactive exploration
5. **Export Generation:** Professional report creation

### API Endpoints

```
POST /api/analysis/cultural-profile    # Generate cultural DNA
GET  /api/qloo/search                 # Search cultural entities
GET  /api/qloo/similar                # Get similar entities
POST /api/openai/narrative            # Generate cultural stories
POST /api/openai/discoveries          # Create personalized recommendations
```

## 🎯 How It Works

### 1. Cultural Preference Collection

Users input their favorite items across five domains:

- **Music:** Artists, genres, songs (Eminem, Central Cee, Alan Walker)
- **Movies & TV:** Films, shows, directors (Lion King, Fast & Furious, In Time)
- **Food & Dining:** Cuisines, restaurants, dishes (Casa D'Angelo, Street food, Sushi)
- **Travel:** Destinations, experiences (Los Angeles, Thailand, Turkey)
- **Books:** Authors, genres, titles (LLM Handbook, Naruto)

### 2. Qloo Intelligence Processing

- **Entity Mapping:** Match user inputs to Qloo's cultural database
- **Cross-Domain Analysis:** Find hidden connections between preferences
- **Popularity Scoring:** Weight preferences by cultural significance
- **Relationship Strength:** Calculate connection strengths (95% Music ↔ Movies)

### 3. LLM Narrative Generation

- **Cultural Story Creation:** Generate 4-chapter narratives explaining connections
- **Personality Analysis:** Extract deep cultural patterns and themes
- **Future Predictions:** Forecast cultural evolution over 24 months
- **Growth Opportunities:** Identify areas for cultural expansion

### 4. Visualization & Export

- **3D Constellation:** Interactive exploration of cultural universe
- **Professional Reports:** PDF generation in multiple formats
- **Social Sharing:** Viral-ready cultural DNA cards

## 🏆 Hackathon Submission Compliance

### **✅ Project Requirements Met**

- **✓ LLM + Qloo Integration** - Clear synergy between OpenAI GPT-4o and Qloo's cultural intelligence
- **✓ Working Application** - Fully functional web app running consistently
- **✓ Beyond Individual Capabilities** - Achieves results neither technology could accomplish alone
- **✓ New Application** - Created entirely during hackathon submission period
- **✓ Proper Authorization** - All third-party tools used under appropriate licenses

### **📋 Submission Requirements**

- **✓ Functional Demo App** - [Live URL: kulturalmente.space](https://kulturalmente.space)
- **✓ Public Repository** - Complete source code with documentation
- **✓ Text Description** - Comprehensive feature and functionality explanation
- **✓ Demo Video** - Under 3 minutes showing application in action
- **✓ Third-Party Credits** - All external libraries and tools properly credited

### **🎯 Judging Criteria Excellence**

#### **🧠 Intelligent & Thoughtful Use of LLMs**

- **Cultural Narrative Generation** - Creates meaningful stories from scattered preferences
- **Cross-Domain Analysis** - LLM capabilities enhanced by Qloo's cultural intelligence
- **Predictive Insights** - 24-month cultural evolution forecasting
- **Personalized Recommendations** - Context-aware suggestions based on cultural DNA

#### **🔗 Integration with Qloo's API**

- **Cross-Domain Affinities** - Showcases Music ↔ Movies 95% strength connections
- **Privacy-First Data** - No personal information required, only cultural preferences
- **Real-Time Intelligence** - Live cultural pattern recognition across 5 domains
- **Entity Mapping** - Professional integration with Qloo's cultural database

#### **⚙️ Technical Implementation & Execution**

- **Industry-Quality Code** - Professional Next.js TypeScript implementation
- **Smooth Operation** - Robust error handling and seamless user experience
- **Effective Integration** - Sophisticated Qloo + OpenAI API coordination
- **Frontend Excellence** - Polished UI with advanced animations and interactions

#### **💡 Originality & Creativity**

- **Cultural DNA Concept** - Novel approach to preference analysis and identity discovery
- **3D Visualization** - Interactive cultural constellation exploration
- **Narrative Intelligence** - Transforms data into compelling personal stories
- **Boundary Pushing** - Goes far beyond traditional recommendation systems

#### **🌍 Potential for Real-World Application**

- **Personal Development** - Helps users understand their cultural identity
- **Travel & Discovery** - Guides cultural exploration and experience planning
- **Content Curation** - Enables deeper, more meaningful recommendation systems
- **Social Connection** - Facilitates cultural identity sharing and comparison
- **Scalable Solution** - Architecture supports millions of cultural profiles

## 🌍 Real-World Applications

- **Personal Development:** Understand your cultural identity and growth areas
- **Travel Planning:** Discover destinations aligned with your cultural preferences
- **Content Discovery:** Find books, movies, music that truly resonate
- **Social Connection:** Share and compare cultural DNA with friends
- **Cultural Education:** Learn about global cultural patterns and connections

## 📁 Project Structure

```
kulturalmente/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── analysis/      # Cultural analysis endpoints
│   │   │   ├── qloo/         # Qloo API integration
│   │   │   └── openai/       # OpenAI service endpoints
│   │   ├── onboarding/       # Cultural preference collection
│   │   ├── results/          # Cultural DNA results display
│   │   └── demo/             # Demo page
│   ├── components/           # Reusable React components
│   │   ├── CulturalWowFactor.tsx
│   │   ├── Navigation.tsx
│   │   └── PDFExportModal.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── use-preferences.ts
│   │   ├── use-search.ts
│   │   └── use-pdf-export.ts
│   └── lib/                 # Core services and utilities
│       ├── qloo-service.ts
│       ├── server-openai-service.ts
│       ├── types.ts
│       └── utils.ts
├── public/                  # Static assets
└── README.md
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all environment variables are properly configured:

- `QLOO_API_URL` and `QLOO_API_KEY` for Qloo integration
- `OPENAI_API_KEY` for AI narrative generation

## 📜 Third-Party Credits & Compliance

_As required by Qloo LLM Hackathon rules: "External libraries, tools, or datasets are permitted, but must be credited."_

### **🔑 Core APIs & Services**

- **Qloo Taste AI™ API** - Cultural intelligence platform (Licensed for hackathon use)
- **OpenAI API** - GPT-4o language model (Commercial license)

### **⚖️ License Compliance**

- All external libraries are used in accordance with their respective license terms
- No proprietary or copyrighted content is reproduced without permission
- All third-party integrations comply with hackathon requirements
- Source code properly attributes all external dependencies

### **🔒 Data & Privacy**

- **Privacy-First Approach** - No personal identifying data collected
- **Qloo's Privacy Standards** - Compliant with Qloo's privacy-first data approach
- **User Consent** - Cultural preferences voluntarily provided
- **Data Processing** - All analysis done with user-provided cultural preferences only

### **📋 Hackathon Compliance**

- ✅ **New Application** - Created entirely during hackathon period
- ✅ **Required Integration** - Qloo API + LLM (GPT-4o) combination
- ✅ **Authorization** - All APIs used under proper licensing terms
- ✅ **Third-Party Credits** - All external tools properly credited
- ✅ **Functionality** - Application runs consistently as demonstrated
- ✅ **Platform** - Web application accessible via provided URL

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Qloo** for providing the incredible Taste AI™ API and hosting this hackathon
- **OpenAI** for the powerful language models that make cultural storytelling possible
- **Next.js** team for the amazing React framework
- **Vercel** for seamless deployment capabilities

## 👨‍💻 Author

**Ajito Nelson Lucio da Costa**  
Built with ❤️ for the Qloo LLM Hackathon 2025

---

**Experience KulturalMente:** [Live Demo](https://kulturalmente.space)  
**Watch Demo Video:** [3-Minute Walkthrough](https://youtu.be/feLsoE9Q_Gk)

_"Your Mind. Your Culture. Your Story."_ 🧠✨
