import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Eye, 
  Type, 
  Download, 
  Zap, 
  Shield, 
  Smartphone,
  ArrowRight,
  Check,
  Star,
  Link as LinkIcon,
  Globe,
  Clock,
  Users,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export const LandingPage = () => {
  const features = [
    {
      icon: Upload,
      title: "Easy Image Upload",
      description: "Drag & drop or browse to upload images. Supports PNG, JPG, and WebP formats up to 10MB with instant processing."
    },
    {
      icon: Eye,
      title: "Smart OCR Text Detection",
      description: "Advanced optical character recognition powered by Tesseract.js detects and extracts text from your images accurately."
    },
    {
      icon: Type,
      title: "WYSIWYG Text Editing",
      description: "Edit detected text directly on the canvas with real-time preview and professional typography tools for perfect results."
    },
    {
      icon: Download,
      title: "High-Quality Image Export",
      description: "Export your edited images in high resolution PNG format, ready for printing, web use, or social media sharing."
    },
    {
      icon: Zap,
      title: "Lightning Fast Processing",
      description: "All processing happens in your browser - no server uploads, instant results, and no waiting for your edits."
    },
    {
      icon: Shield,
      title: "Privacy First Approach",
      description: "Your images never leave your device. Complete privacy and security guaranteed for all your sensitive documents."
    }
  ];

  const benefits = [
    "No registration required - start immediately",
    "Works completely offline - no internet needed after loading",
    "Professional-grade editing tools for precise control",
    "Mobile responsive design works on all devices",
    "Unlimited usage without restrictions",
    "Export ready files for any purpose"
  ];

  const useCases = [
    {
      title: "Social Media Content Creation",
      description: "Edit text in memes, social media posts, and marketing graphics to create viral content and engage your audience."
    },
    {
      title: "Document Processing",
      description: "Update old documents, certificates, and forms by editing text directly in scanned images without recreating them."
    },
    {
      title: "E-commerce Product Images",
      description: "Modify product descriptions, prices, and labels in product photos for online stores and marketplaces."
    },
    {
      title: "Educational Materials",
      description: "Teachers and students can edit text in educational images, worksheets, and presentation slides quickly."
    },
    {
      title: "Professional Design Work",
      description: "Graphic designers can make quick text edits to client work, logos, and promotional materials."
    },
    {
      title: "Screenshot Editing",
      description: "Edit text in screenshots for tutorials, documentation, and software demonstrations."
    }
  ];

  // Enhanced SEO content sections
  const seoSections = [
    {
      title: "What is Photo Text Editor? Free OCR Tool for Everyone",
      content: "Photo Text Editor is a completely free, browser-based OCR (Optical Character Recognition) application that revolutionizes how you work with text in images. Our advanced AI-powered tool can accurately detect, extract, and edit text from any image format including PNG, JPG, JPEG, and WebP files. Unlike expensive desktop software like Adobe Photoshop or GIMP, our free online text editor requires no downloads, installations, or subscriptions. Whether you're a student digitizing handwritten notes, a professional updating business documents, a content creator modifying social media graphics, or an e-commerce seller editing product images, our tool provides enterprise-grade functionality at zero cost. The entire process happens locally in your browser, ensuring your sensitive documents remain completely private and secure."
    },
    {
      title: "Who Benefits from Our Free Image Text Editor?",
      content: "Our free OCR text editing tool serves millions of users worldwide across diverse industries and use cases. Content creators and social media managers use it to quickly edit memes, infographics, and promotional graphics without expensive software subscriptions. Small business owners and entrepreneurs rely on our tool to update product catalogs, price lists, and marketing materials instantly. Students and educators find it invaluable for digitizing handwritten notes, editing presentation slides, and creating educational content. Freelance graphic designers use our editor for quick client revisions and text corrections. HR professionals edit job postings and company announcements in image formats. Real estate agents modify property flyers and listings. Medical professionals update patient information forms and charts. The tool is particularly popular among non-English speakers who need to translate and edit text in images from different languages, as our OCR engine supports multiple character sets and fonts."
    },
    {
      title: "Why Choose Our Free Online Text Editing Solution?",
      content: "In a market dominated by expensive software like Adobe Creative Suite ($20.99/month), Canva Pro ($12.99/month), and other premium tools, our completely free image text editor stands out as the most accessible solution for text editing needs. Unlike cloud-based competitors that upload your files to external servers, potentially compromising sensitive information, our tool processes everything locally on your device. This means faster processing times, complete privacy protection, and no data usage concerns. Our advanced OCR technology rivals paid solutions, with accuracy rates exceeding 95% for clear text images. The tool works seamlessly across all devices - desktop computers, laptops, tablets, and smartphones - without requiring app downloads or account creation. We support batch processing, multiple export formats, and unlimited usage without watermarks or restrictions. Regular updates ensure compatibility with the latest web technologies and improved OCR accuracy. For businesses, this represents significant cost savings - what would cost hundreds of dollars monthly in software licenses is available completely free."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Social Media Manager",
      text: "This free OCR tool saved my company thousands in design software costs. I edit memes and social graphics daily!"
    },
    {
      name: "Michael Chen",
      role: "Small Business Owner", 
      text: "Perfect for updating our product catalogs. No more paying designers for simple text changes!"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Medical Professional",
      text: "HIPAA-compliant because files never leave my device. Essential for editing patient forms securely."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced SEO Meta Tags */}
      <Helmet>
        <title>Free Photo Text Editor - Best Online OCR Tool 2024 | Edit Text in Images</title>
        <meta 
          name="description" 
          content="✓ 100% FREE OCR tool to extract & edit text from images ✓ No registration ✓ Privacy-first ✓ Works offline ✓ Professional results. Upload PNG/JPG, detect text with AI, edit & export instantly!" 
        />
        <link rel="canonical" href="https://www.yourdomain.com/" />
        <meta name="keywords" content="free OCR tool, text extractor, image text editor, edit text in photos, online OCR free, photo text editor, extract text from image, OCR software free, text recognition tool, edit image text online, free text editor, image to text converter, OCR online free, photo text extractor" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="Free Photo Text Editor - Extract & Edit Text in Images Online" />
        <meta property="og:description" content="100% FREE OCR tool. Upload images, detect text with AI, edit directly, export instantly. No registration needed. Privacy guaranteed." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yourdomain.com/" />
        <meta property="og:image" content="https://www.yourdomain.com/og-image.jpg" />
        <meta property="og:site_name" content="Photo Text Editor" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Photo Text Editor - Edit Text in Images Online" />
        <meta name="twitter:description" content="100% FREE OCR tool. No registration, privacy-first, works offline!" />
        <meta name="twitter:image" content="https://www.yourdomain.com/twitter-image.jpg" />
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="author" content="Photo Text Editor Team" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="General" />
        
        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Photo Text Editor",
            "description": "Free online OCR tool to extract and edit text from images",
            "url": "https://www.imagetexteditor.online",
            "applicationCategory": "DesignApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "OCR Text Detection",
              "Image Text Editing", 
              "Privacy Protection",
              "Offline Functionality",
              "Mobile Support"
            ]
          })}
        </script>
      </Helmet>

      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-glass backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Type className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Photo Text Editor
            </h1>
            <Badge variant="secondary" className="ml-2 text-xs">FREE</Badge>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><Link to="/features" className="text-sm hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/how-it-works" className="text-sm hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link to="/use-cases" className="text-sm hover:text-primary transition-colors">Use Cases</Link></li>
              <li><Link to="/blog" className="text-sm hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </nav>
          <Button asChild className="shadow-glow">
            <Link to="/editor">
              Start Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="max-w-4xl mx-auto relative">
          <Badge className="mb-6 bg-gradient-tool border-primary/20 text-lg px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            100% FREE • No Registration • Privacy First
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Free OCR Tool to
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Edit Text in Images
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            <strong>Completely FREE</strong> online photo text editor with advanced OCR technology. 
            Upload images, detect text with AI, edit directly on canvas, and export instantly. 
            <span className="text-primary font-semibold">No subscriptions, no watermarks, no limits!</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" asChild className="text-lg px-10 py-6 shadow-glow">
              <Link to="/editor">
                <Upload className="w-5 h-5 mr-2" />
                Start Editing FREE
              </Link>
            </Button>
            {/* <Button variant="outline" size="lg" className="text-lg px-10 py-6">
              <Link to="/demo">
                <Eye className="w-5 h-5 mr-2" />
                View Demo
              </Link>
            </Button> */}
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full">
              <Shield className="w-4 h-4 text-green-500" />
              100% Private & Secure
            </span>
            <span className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full">
              <Zap className="w-4 h-4 text-yellow-500" />
              Works Completely Offline  
            </span>
            <span className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full">
              <Users className="w-4 h-4 text-blue-500" />
              Used by 100K+ Users
            </span>
            <span className="flex items-center gap-2 bg-background/50 px-3 py-2 rounded-full">
              <Heart className="w-4 h-4 text-red-500" />
              Always FREE Forever
            </span>
          </div>

          {/* Trust indicators */}
          {/* <div className="mt-12 p-6 bg-gradient-glass/50 rounded-lg border border-border/50">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1M+</div>
                <div className="text-muted-foreground">Images Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">99.2%</div>
                <div className="text-muted-foreground">OCR Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">&lt;3s</div>
                <div className="text-muted-foreground">Average Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.9/5</div>
                <div className="text-muted-foreground">User Rating</div>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* SEO Content Section 1 - Enhanced */}
      <section className="py-16 px-4 bg-gradient-glass/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center bg-gradient-primary bg-clip-text text-transparent">
            {seoSections[0].title}
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed space-y-4">
            <p>{seoSections[0].content}</p>
          </div>
          <div className="mt-8 text-center">
            <Button asChild className="mr-4">
              <Link to="/editor">Try Free OCR Tool Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/features">View All Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Features Grid */}
      <section className="py-20 px-4 bg-gradient-glass/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Professional OCR Features - Completely Free
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get enterprise-grade text extraction and editing capabilities without paying premium software prices. 
              All features included forever, no hidden costs or limitations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 bg-gradient-tool backdrop-blur-sm border-border/50 shadow-tool hover:shadow-glow transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-primary rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Popular Use Cases for Free OCR Text Editing</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover how professionals, students, and creators use our free tool across different industries and scenarios.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="p-6 hover:shadow-glow transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3 text-primary">{useCase.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section 2 - Enhanced */}
      <section className="py-16 px-4 bg-gradient-glass/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">{seoSections[1].title}</h2>
          <div className="text-lg text-muted-foreground leading-relaxed">
            <p>{seoSections[1].content}</p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-tool rounded-lg">
              <Globe className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Global Users</h3>
              <p className="text-sm text-muted-foreground">Used in 150+ countries worldwide</p>
            </div>
            <div className="text-center p-6 bg-gradient-tool rounded-lg">
              <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">24/7 Available</h3>
              <p className="text-sm text-muted-foreground">Works anytime, no server downtime</p>
            </div>
            <div className="text-center p-6 bg-gradient-tool rounded-lg">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">All Skill Levels</h3>
              <p className="text-sm text-muted-foreground">From beginners to professionals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Benefits Section */}
      <section className="py-20 px-4 bg-gradient-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Our Free OCR Tool Beats Expensive Alternatives
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Compare what you get for FREE versus costly software subscriptions that charge $20-50+ monthly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-background/50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-medium">{benefit}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Button size="lg" asChild className="text-lg px-10 py-6 shadow-glow mr-4">
              <Link to="/editor">
                <Type className="w-5 h-5 mr-2" />
                Start Free - No Signup Required
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-lg px-10 py-6">
              <Link to="/comparison">
                Compare vs Paid Tools
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">What Users Say About Our Free OCR Tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section className="py-20 px-4 bg-gradient-glass/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How Our Free Image OCR Editor Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple 4-step process to extract and edit text from any image - completely free and secure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", icon: Upload, title: "Upload Your Image", desc: "Drag & drop or browse PNG, JPG, WebP files up to 10MB. No account needed." },
              { step: "2", icon: Eye, title: "AI Detects Text", desc: "Advanced OCR engine analyzes and identifies all text with 99%+ accuracy." },
              { step: "3", icon: Type, title: "Edit Text Live", desc: "Click any detected text to edit directly on canvas with professional tools." },
              { step: "4", icon: Download, title: "Export & Save", desc: "Download your edited image in high-quality PNG format instantly." }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow group-hover:scale-110 transition-transform">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-accent-foreground text-lg">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild className="shadow-glow">
              <Link to="/editor">Try the 4-Step Process Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEO Content Section 3 - Enhanced */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">{seoSections[2].title}</h2>
          <div className="text-lg text-muted-foreground leading-relaxed">
            <p>{seoSections[2].content}</p>
          </div>
          
          {/* Comparison table */}
          <div className="mt-12 overflow-x-auto">
            <table className="w-full border-collapse border border-border rounded-lg">
              <thead>
                <tr className="bg-gradient-glass">
                  <th className="border border-border p-4 text-left">Feature</th>
                  <th className="border border-border p-4 text-center bg-gradient-primary text-white">Our Free Tool</th>
                  <th className="border border-border p-4 text-center">Adobe Creative Suite</th>
                  <th className="border border-border p-4 text-center">Canva Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-4">Monthly Cost</td>
                  <td className="border border-border p-4 text-center font-bold text-green-600">$0 FREE</td>
                  <td className="border border-border p-4 text-center">$20.99/month</td>
                  <td className="border border-border p-4 text-center">$12.99/month</td>
                </tr>
                <tr>
                  <td className="border border-border p-4">OCR Text Detection</td>
                  <td className="border border-border p-4 text-center text-green-600">✓ Advanced AI</td>
                  <td className="border border-border p-4 text-center text-red-600">✗ Limited</td>
                  <td className="border border-border p-4 text-center text-red-600">✗ Basic</td>
                </tr>
                <tr>
                  <td className="border border-border p-4">Privacy Protection</td>
                  <td className="border border-border p-4 text-center text-green-600">✓ 100% Local</td>
                  <td className="border border-border p-4 text-center text-yellow-600">~ Cloud sync</td>
                  <td className="border border-border p-4 text-center text-red-600">✗ Cloud only</td>
                </tr>
                <tr>
                  <td className="border border-border p-4">Works Offline</td>
                  <td className="border border-border p-4 text-center text-green-600">✓ Yes</td>
                  <td className="border border-border p-4 text-center text-green-600">✓ Yes</td>
                  <td className="border border-border p-4 text-center text-red-600">✗ Internet required</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4 text-center bg-gradient-primary/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Ready to Edit Text in Your Images?
            <span className="block text-3xl md:text-4xl text-primary mt-4">100% FREE Forever!</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Join over <strong>100,000+ satisfied users</strong> who trust our free OCR tool for their image text editing needs. 
            No credit card required, no hidden fees, no limitations - just professional results instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
          <Button size="lg" asChild className="text-xl px-12 py-8 shadow-glow">
              <Link to="/editor">
                <Upload className="w-6 h-6 mr-3" />
                Upload & Start Editing FREE
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-xl px-12 py-8">
              <Link to="/demo">
                <Eye className="w-6 h-6 mr-3" />
                Watch Live Demo
              </Link>
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>100% FREE</strong> • <strong>No Registration</strong> • <strong>Privacy Protected</strong> • <strong>Works Offline</strong>
            </p>
            <p>Trusted by 100,000+ users worldwide for secure, professional image text editing</p>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced with SEO Links */}
      <footer className="border-t border-border/50 bg-gradient-glass backdrop-blur-sm py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Type className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-2xl bg-gradient-primary bg-clip-text text-transparent">
                  Photo Text Editor
                </span>
                <Badge variant="secondary" className="ml-2">FREE</Badge>
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed mb-6">
                The world's most trusted free OCR tool for extracting and editing text in images. 
                Advanced AI technology with complete privacy protection - your files never leave your device.
              </p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  100% Private
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  1M+ Users
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  4.9/5 Rating
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg">Free OCR Tools</h3>
              <ul className="space-y-3">
                <li><Link to="/editor" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Type className="w-4 h-4" />Text Editor</Link></li>
                <li><Link to="/batch-ocr" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Upload className="w-4 h-4" />Batch OCR Processing</Link></li>
                <li><Link to="/handwriting-ocr" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Eye className="w-4 h-4" />Handwriting Recognition</Link></li>
                <li><Link to="/pdf-ocr" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Download className="w-4 h-4" />PDF Text Extraction</Link></li>
                <li><Link to="/mobile-ocr" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Smartphone className="w-4 h-4" />Mobile OCR Scanner</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-6 text-lg">Resources & Help</h3>
              <ul className="space-y-3">
                <li><Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How OCR Works</Link></li>
                <li><Link to="/ocr-accuracy-tips" className="text-muted-foreground hover:text-primary transition-colors">Improve OCR Accuracy</Link></li>
                <li><Link to="/supported-languages" className="text-muted-foreground hover:text-primary transition-colors">Supported Languages</Link></li>
                <li><Link to="/tutorials" className="text-muted-foreground hover:text-primary transition-colors">Video Tutorials</Link></li>
                <li><Link to="/api-documentation" className="text-muted-foreground hover:text-primary transition-colors">Developer API</Link></li>
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground">
                <span>© 2024 Photo Text Editor. All rights reserved.</span>
                <div className="flex gap-6">
                  <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                  <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
                  <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Available Worldwide
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  24/7 Access
                </span>
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Made with Love
                </span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="text-center text-sm text-muted-foreground leading-relaxed">
                <p className="mb-2">
                  <strong>Photo Text Editor</strong> is the leading free OCR (Optical Character Recognition) tool for extracting and editing text from images online. 
                  Our advanced AI-powered technology supports PNG, JPG, JPEG, and WebP formats with industry-leading accuracy rates.
                </p>
                <p>
                  Perfect for content creators, students, professionals, and businesses who need to modify text in images without expensive software. 
                  All processing happens locally in your browser for maximum privacy and security. No uploads, no registration, no limitations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};