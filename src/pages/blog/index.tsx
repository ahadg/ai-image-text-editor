import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  User,
  ArrowRight,
  Search,
  Tag,
  Share,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const BlogPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  
  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "How to Extract Text from Images with Our OCR Tool",
      excerpt: "Learn how to use our advanced OCR technology to extract text from any image quickly and accurately.",
      content: "Our OCR tool uses Tesseract.js to provide accurate text extraction from images. In this guide, we'll show you how to get the best results...",
      author: "Sarah Johnson",
      date: "2024-03-15",
      readTime: "5 min read",
      category: "Tutorials",
      tags: ["OCR", "Text Extraction", "How-To"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 2,
      title: "5 Creative Ways to Use Photo Text Editor for Your Business",
      excerpt: "Discover innovative applications of our text editing tool to enhance your business materials and marketing assets.",
      content: "Businesses across industries are finding creative ways to use our Photo Text Editor. From updating old documents to creating new marketing materials...",
      author: "Michael Chen",
      date: "2024-03-10",
      readTime: "7 min read",
      category: "Business",
      tags: ["Business", "Marketing", "Productivity"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 3,
      title: "The Technology Behind Our Browser-Based OCR System",
      excerpt: "A deep dive into how we implemented client-side OCR processing without compromising speed or accuracy.",
      content: "Unlike other OCR tools that require server processing, our solution works entirely in your browser. This technical overview explains how we achieved this...",
      author: "Alex Rivera",
      date: "2024-03-05",
      readTime: "10 min read",
      category: "Technology",
      tags: ["Technology", "OCR", "Web Development"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 4,
      title: "Why Privacy Matters in Online Tools and How We Protect Yours",
      excerpt: "Exploring our commitment to privacy and why your images never leave your device during processing.",
      content: "In an era of increasing data concerns, we've built our tool with privacy as a core principle. Learn about our approach to keeping your data secure...",
      author: "Emma Wilson",
      date: "2024-02-28",
      readTime: "6 min read",
      category: "Privacy",
      tags: ["Privacy", "Security", "Data Protection"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 5,
      title: "Comparing Online OCR Tools: What Makes Ours Different",
      excerpt: "An objective comparison of available OCR solutions and the unique advantages of our approach.",
      content: "The market has many OCR tools, but they differ significantly in features, accuracy, and privacy. Here's how our solution compares to alternatives...",
      author: "David Kim",
      date: "2024-02-20",
      readTime: "8 min read",
      category: "Reviews",
      tags: ["Comparison", "OCR Tools", "Features"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 6,
      title: "Tips for Getting the Best OCR Results from Your Images",
      excerpt: "Professional advice on preparing your images to achieve the highest text recognition accuracy.",
      content: "OCR accuracy depends heavily on image quality. Follow these expert tips to ensure your images produce the best possible text recognition results...",
      author: "Lisa Zhang",
      date: "2024-02-15",
      readTime: "4 min read",
      category: "Tips & Tricks",
      tags: ["Tips", "Best Practices", "OCR Accuracy"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 7,
      title: "How to Edit Text in Images for Social Media Marketing",
      excerpt: "Boost your social media engagement with professionally edited images containing optimized text content.",
      content: "Social media platforms prioritize visual content. Learn how to create eye-catching images with perfectly edited text that drives engagement and conversions...",
      author: "James Wilson",
      date: "2024-02-10",
      readTime: "7 min read",
      category: "Marketing",
      tags: ["Social Media", "Marketing", "Content Creation"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 8,
      title: "The Future of OCR Technology: What to Expect in Coming Years",
      excerpt: "Exploring emerging trends in optical character recognition and how they might shape future tools.",
      content: "OCR technology is evolving rapidly. From handwriting recognition to complex document analysis, here's what the future holds for text extraction tools...",
      author: "Rachel Brown",
      date: "2024-02-05",
      readTime: "9 min read",
      category: "Technology",
      tags: ["Future", "OCR", "Innovation"],
      image: "/api/placeholder/400/250"
    },
    {
      id: 9,
      title: "Case Study: How a Publishing Company Saved Time with Our Tool",
      excerpt: "A real-world example of how our text editor streamlined workflows for a busy publishing house.",
      content: "This case study examines how a mid-sized publishing company integrated our tool into their workflow, saving countless hours in text extraction and editing...",
      author: "Thomas Miller",
      date: "2024-01-28",
      readTime: "6 min read",
      category: "Case Studies",
      tags: ["Case Study", "Publishing", "Efficiency"],
      image: "/api/placeholder/400/250"
    }
  ];

  const categories = [
    { name: "Tutorials", count: 3 },
    { name: "Technology", count: 2 },
    { name: "Business", count: 2 },
    { name: "Marketing", count: 1 },
    { name: "Privacy", count: 1 },
    { name: "Tips & Tricks", count: 1 },
    { name: "Case Studies", count: 1 },
    { name: "Reviews", count: 1 }
  ];

  const tags = [
    "OCR", "Text Extraction", "How-To", "Business", "Marketing", 
    "Productivity", "Technology", "Privacy", "Security", "Data Protection",
    "Comparison", "Tips", "Best Practices", "Social Media", "Future",
    "Innovation", "Case Study", "Publishing", "Efficiency"
  ];

  const featuredPost = blogPosts[0];
  
  // Calculate pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-glass backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Photo Text Editor Blog
            </h1>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-sm hover:text-primary transition-colors">Home</Link>
            <Link to="/editor" className="text-sm hover:text-primary transition-colors">Editor</Link>
            <Button asChild variant="outline" size="sm">
              <Link to="/editor">
                Try Editor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Blog Hero */}
      <section className="py-16 px-4 bg-gradient-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-gradient-tool border-primary/20">
            Insights & Tutorials
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Learn How to Master
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Text Editing in Images
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover tips, tutorials, and industry insights on OCR technology, image editing, 
            and creative ways to use our Photo Text Editor.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search blog posts..." 
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Featured Post */}
          <Card className="overflow-hidden mb-12 group">
            <div className="relative h-64 overflow-hidden">
              <img 
                src={featuredPost.image} 
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <Badge className="mb-2 bg-background text-foreground hover:bg-background">
                  {featuredPost.category}
                </Badge>
                <h2 className="text-2xl font-bold text-white mb-2">
                  <Link to={`/blog/${featuredPost.id}`} className="hover:underline">
                    {featuredPost.title}
                  </Link>
                </h2>
                <div className="flex items-center text-sm text-white/80">
                  <User className="w-4 h-4 mr-1" />
                  <span className="mr-4">{featuredPost.author}</span>
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="mr-4">{featuredPost.date}</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{featuredPost.readTime}</span>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-4">{featuredPost.excerpt}</p>
              <Button asChild>
                <Link to={`/blog/${featuredPost.id}`}>
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Blog Posts Grid */}
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-background text-foreground hover:bg-background">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    <Link to={`/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </h3>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-muted-foreground">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-4 border-t border-border">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/blog/${post.id}`}>
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <Button
                key={number}
                variant={currentPage === number ? "default" : "outline"}
                size="sm"
                onClick={() => paginate(number)}
              >
                {number}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* About Card */}
          <Card className="p-6 bg-gradient-tool border-border/50">
            <h3 className="font-semibold text-lg mb-4">About This Blog</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Welcome to the Photo Text Editor blog! Here we share tips, tutorials, and insights 
              about OCR technology, image editing, and creative ways to use our tool.
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/editor">
                Try Our Editor
              </Link>
            </Button>
          </Card>

          {/* Categories */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name} className="flex justify-between items-center">
                  <Link 
                    to={`/blog/category/${category.name.toLowerCase()}`} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>

          {/* Popular Tags */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Newsletter Signup */}
          <Card className="p-6 bg-gradient-primary/5 border-primary/20">
            <h3 className="font-semibold text-lg mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Get the latest tutorials, updates, and tips directly to your inbox.
            </p>
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
              <Button className="w-full">Subscribe</Button>
            </div>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-primary/5 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Edit Text in Your Images?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Put what you've learned into practice with our powerful yet easy-to-use editor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/editor">
                Try It Now - Free
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/tutorials">
                View Tutorials
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-glass backdrop-blur-sm py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-xl">Photo Text Editor Blog</span>
            </div>
            <p className="text-muted-foreground max-w-md text-sm">
              Insights, tutorials, and news about OCR technology and image text editing. 
              Learn how to get the most out of our Photo Text Editor.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Blog Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/blog/category/tutorials" className="text-muted-foreground hover:text-primary transition-colors">Tutorials</Link></li>
              <li><Link to="/blog/category/technology" className="text-muted-foreground hover:text-primary transition-colors">Technology</Link></li>
              <li><Link to="/blog/category/business" className="text-muted-foreground hover:text-primary transition-colors">Business</Link></li>
              <li><Link to="/blog/category/marketing" className="text-muted-foreground hover:text-primary transition-colors">Marketing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/editor" className="text-muted-foreground hover:text-primary transition-colors">Editor</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1 md:col-span-4 border-t border-border/50 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <span className="text-sm text-muted-foreground">© 2024 Photo Text Editor Blog. All rights reserved.</span>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
