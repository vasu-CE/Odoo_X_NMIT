import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import SplitText from "../components/SplitText";
import {
  Factory,
  Package,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Award,
  Globe,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Factory,
      title: "Smart Manufacturing",
      description:
        "Streamline your production processes with intelligent automation and real-time monitoring.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Make data-driven decisions with comprehensive reporting and performance insights.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Package,
      title: "Inventory Management",
      description:
        "Track materials, components, and finished goods with precision and efficiency.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Connect your entire team with role-based access and seamless communication.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description:
        "Monitor work orders, production status, and resource utilization in real-time.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Protect your data with enterprise-grade security and compliance features.",
      color: "from-gray-600 to-gray-800",
    },
  ];

  const stats = [
    { value: "500+", label: "Manufacturing Companies" },
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "40%", label: "Efficiency Increase" },
    { value: "24/7", label: "Expert Support" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrollY > 50
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                <img
                  src="/logo.png"
                  alt="ManufacturingOS Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">
                ManufacturingOS
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="border-gray-300 hover:border-blue-500 hover:text-blue-600"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Get Started
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
              <div className="px-4 py-6 space-y-4">
                <a
                  href="#features"
                  className="block text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Features
                </a>
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/login")}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate("/signup")}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Badge */}
            {/* <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Next-Generation Manufacturing ERP
              </Badge>
            </div> */}

            {/* Main Headline */}
            <div className="space-y-4">
              <SplitText
                text="Transform Your Manufacturing Operations"
                tag="h1"
                className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight"
                delay={50}
                duration={0.8}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 60 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
              />
              <SplitText
                text="Streamline production, optimize workflows, and boost efficiency with our comprehensive manufacturing management platform."
                className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="words"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
              />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate("/signup")}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300"
              >
                Login
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 text-sm sm:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SplitText
              text="Powerful Features for Modern Manufacturing"
              tag="h2"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
              delay={50}
              duration={0.8}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 50 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
            <SplitText
              text="Everything you need to manage your manufacturing operations efficiently and scale your business."
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SplitText
            text="Ready to Transform Your Manufacturing?"
            tag="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            delay={50}
            duration={0.8}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0, y: 50 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <SplitText
            text="Join hundreds of manufacturing companies that have already revolutionized their operations with ManufacturingOS."
            className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              Login to Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="ManufacturingOS Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xl font-bold">ManufacturingOS</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The next-generation manufacturing ERP platform designed for
                modern production environments.
              </p>
              <div className="flex items-center gap-4">
                <Globe className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400">
                  Global Manufacturing Solutions
                </span>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ManufacturingOS. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(
            circle at 1px 1px,
            rgba(0, 0, 0, 0.15) 1px,
            transparent 0
          );
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
