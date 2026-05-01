import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { Article } from '@/pages/Article';
import { TagPage } from '@/pages/Tag';
import { TagsOverview } from '@/pages/Tags';
import { About } from '@/pages/About';
import { Category } from '@/pages/Category';
import { Archives } from '@/pages/Archives';
import { WebsitesResources } from '@/pages/ResourcesWebsites';
import { LearningResources } from '@/pages/ResourcesLearning';
import { ToolsResources } from '@/pages/ResourcesTools';
import { Profile } from '@/pages/Profile';
import { AdminDashboard } from '@/pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/tag/:tagName" element={<TagPage />} />
          <Route path="/tags" element={<TagsOverview />} />
          <Route path="/about" element={<About />} />
          <Route path="/category/:categorySlug" element={<Category />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/resources/websites" element={<WebsitesResources />} />
          <Route path="/resources/learning" element={<LearningResources />} />
          <Route path="/resources/tools" element={<ToolsResources />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
