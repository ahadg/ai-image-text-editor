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
  Star
} from "lucide-react";
import { Link } from "react-router-dom";

export const LandingPage = () => {
  const features = [
    {
      icon: Upload,
      title: "Easy Upload",
      description: "Drag & drop or browse to upload images. Supports PNG, JPG, and WebP formats up to 10MB."
    },
    {
      icon: Eye,
      title: "Smart OCR Detection",
      description: "Advanced text recognition powered by Tesseract.js detects and extracts text from your images."
    },
    {
      icon: Type,
      title: "WYSIWYG Editing",
      description: "Edit detected text directly on the canvas with real-time preview and professional tools."
    },
    {
      icon: Download,
      title: "High-Quality Export",
      description: "Export your edited images in high resolution PNG format, ready for any use case."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "All processing happens in your browser - no server uploads, instant results."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your images never leave your device. Complete privacy and security guaranteed."
    }
  ];

  const benefits = [
    "No registration required",
    "Works completely offline",
    "Professional-grade tools",
    "Mobile responsive design",
    "Unlimited usage",
    "Export ready files"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-glass backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Type className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Photo Text Editor
            </h1>
          </div>
          <Button asChild>
            <Link to="/editor">
              Start Editing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="max-w-4xl mx-auto relative">
          <Badge className="mb-6 bg-gradient-tool border-primary/20">
            <Star className="w-3 h-3 mr-1" />
            Professional OCR Text Editor
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Edit Text in Images
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Like Never Before
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload any image, detect text with advanced OCR, and edit it directly on the canvas. 
            Professional tools, privacy-first approach, and lightning-fast performance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/editor">
                <Upload className="w-5 h-5 mr-2" />
                Start Editing Now
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              <Eye className="w-5 h-5 mr-2" />
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gradient-glass/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Every Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to edit text in images with professional precision and ease.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 bg-gradient-tool backdrop-blur-sm border-border/50 shadow-tool hover:shadow-glow transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Why Choose Our Editor?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-left">
                <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
          
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link to="/editor">
              <Type className="w-5 h-5 mr-2" />
              Try It Now - It's Free
            </Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-glass/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple, fast, and powerful in just 4 steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", icon: Upload, title: "Upload Image", desc: "Drag & drop or browse your image file" },
              { step: "2", icon: Eye, title: "Detect Text", desc: "AI analyzes and finds all text in your image" },
              { step: "3", icon: Type, title: "Edit Text", desc: "Click any text to edit it directly on canvas" },
              { step: "4", icon: Download, title: "Export", desc: "Download your edited image in high quality" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto shadow-glow">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-sm font-bold text-accent-foreground">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center bg-gradient-primary/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Edit Your Images?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust our editor for their image text editing needs. 
            Start now and experience the difference.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="text-lg px-8 py-6 shadow-glow">
              <Link to="/editor">
                <ArrowRight className="w-5 h-5 mr-2" />
                Start Editing for Free
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-glass backdrop-blur-sm py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
              <Type className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">Photo Text Editor</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>© 2024 Photo Text Editor</span>
            <span className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile Responsive
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy First
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};