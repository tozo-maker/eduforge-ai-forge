
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, BookOpen, Brain, CheckCircle, FileText, Grid, LayoutGrid, Lightbulb, Settings } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl text-primary">EduForge AI</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link to="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How It Works</Link>
            <Link to="#educators" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">For Educators</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Create Educational Content with <span className="text-primary">AI</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                EduForge AI transforms how educators create content, using AI to generate lesson plans, 
                assessments, and study materials aligned with educational standards - saving hours of planning time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="px-8">
                  <Link to="/auth/register">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="#how-it-works">See How It Works</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="rounded-xl shadow-xl bg-white p-6 border">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">Configuration</h3>
                    <p className="text-sm text-muted-foreground">Define your educational needs</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center p-3 bg-slate-50 rounded-md">
                    <div className="w-24 text-sm font-medium">Subject:</div>
                    <div className="font-medium text-primary">Mathematics</div>
                  </div>
                  <div className="flex items-center p-3 bg-slate-50 rounded-md">
                    <div className="w-24 text-sm font-medium">Grade Level:</div>
                    <div className="font-medium text-primary">6th Grade</div>
                  </div>
                  <div className="flex items-center p-3 bg-slate-50 rounded-md">
                    <div className="w-24 text-sm font-medium">Approach:</div>
                    <div className="font-medium text-primary">Inquiry-based</div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button className="gap-2">
                    Generate Content <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Features for Educators</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              EduForge AI streamlines the entire educational content creation process with sophisticated tools and AI assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Project Configuration</h3>
              <p className="text-muted-foreground mb-4">
                Sophisticated configuration system that drives all content generation, ensuring educational appropriateness and standards alignment.
              </p>
              <div className="flex items-center text-sm text-primary">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Educational standards integration</span>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Content Generation</h3>
              <p className="text-muted-foreground mb-4">
                Powerful AI generates educationally sound content based on your specific requirements and configuration parameters.
              </p>
              <div className="flex items-center text-sm text-primary">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Powered by Anthropic Claude</span>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Interactive Content Editor</h3>
              <p className="text-muted-foreground mb-4">
                Easily refine and customize AI-generated content with our intuitive editing tools designed for educators.
              </p>
              <div className="flex items-center text-sm text-primary">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Real-time collaboration</span>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Grid className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Version Control System</h3>
              <p className="text-muted-foreground mb-4">
                Track changes and iterate on your educational content with confidence using our built-in versioning system.
              </p>
              <div className="flex items-center text-sm text-primary">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Revision history tracking</span>
              </div>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Content Analysis & Enhancement</h3>
              <p className="text-muted-foreground mb-4">
                AI-powered analysis tools identify opportunities to improve educational effectiveness and engagement.
              </p>
              <div className="flex items-center text-sm text-primary">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Readability and accessibility checks</span>
              </div>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-format Export</h3>
              <p className="text-muted-foreground mb-4">
                Seamlessly export your content in multiple formats for different learning management systems and uses.
              </p>
              <div className="flex items-center text-sm text-primary">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>PDF, Word, HTML and more</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How EduForge AI Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our sophisticated configuration-to-content pipeline transforms your educational requirements into high-quality content.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Step 1 */}
              <div className="flex flex-col md:flex-row items-center mb-12">
                <div className="flex-shrink-0 z-10">
                  <div className="h-14 w-14 rounded-full border-4 border-white bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    1
                  </div>
                </div>
                <div className="md:ml-8 p-6 bg-white rounded-xl shadow-sm border mt-4 md:mt-0 w-full">
                  <h3 className="text-xl font-semibold mb-2">Configure Your Project</h3>
                  <p className="text-muted-foreground">
                    Specify subject, grade level, standards, pedagogical approach, and more to create the DNA for your content generation.
                  </p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col md:flex-row items-center mb-12">
                <div className="flex-shrink-0 z-10">
                  <div className="h-14 w-14 rounded-full border-4 border-white bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    2
                  </div>
                </div>
                <div className="md:ml-8 p-6 bg-white rounded-xl shadow-sm border mt-4 md:mt-0 w-full">
                  <h3 className="text-xl font-semibold mb-2">AI Content Generation</h3>
                  <p className="text-muted-foreground">
                    Your configuration parameters drive our AI to generate educational content precisely tailored to your needs.
                  </p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col md:flex-row items-center mb-12">
                <div className="flex-shrink-0 z-10">
                  <div className="h-14 w-14 rounded-full border-4 border-white bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    3
                  </div>
                </div>
                <div className="md:ml-8 p-6 bg-white rounded-xl shadow-sm border mt-4 md:mt-0 w-full">
                  <h3 className="text-xl font-semibold mb-2">Review and Refine</h3>
                  <p className="text-muted-foreground">
                    Use our interactive editor to review, modify, and enhance the AI-generated content to match your exact vision.
                  </p>
                </div>
              </div>
              
              {/* Step 4 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="flex-shrink-0 z-10">
                  <div className="h-14 w-14 rounded-full border-4 border-white bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    4
                  </div>
                </div>
                <div className="md:ml-8 p-6 bg-white rounded-xl shadow-sm border mt-4 md:mt-0 w-full">
                  <h3 className="text-xl font-semibold mb-2">Export and Implement</h3>
                  <p className="text-muted-foreground">
                    Export your finalized content in multiple formats for immediate use in your educational environment.
                  </p>
                </div>
              </div>
              
              {/* Connecting Line */}
              <div className="absolute left-7 top-7 bottom-7 w-0.5 bg-slate-200 hidden md:block"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Transform Your Educational Content Creation?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of educators already using EduForge AI to create better educational materials in less time.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-slate-100 px-8" asChild>
            <Link to="/auth/register">Get Started For Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-white/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">EduForge AI</span>
              </div>
              <p className="text-sm mb-4">
                AI-powered educational content creation platform for educators, instructional designers, and curriculum developers.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Templates</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Guides</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} EduForge AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
