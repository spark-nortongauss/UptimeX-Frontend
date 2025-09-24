import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import Logo from "@/components/partials/auth/logo";
import Copyright from "@/components/partials/auth/copyright";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-default-50 to-default-100 dark:from-default-900 dark:to-default-800">
      {/* Header */}
      <header className="relative z-50 bg-white/80 dark:bg-default-900/80 backdrop-blur-md border-b border-default-200 dark:border-default-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo />
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-default-600 hover:text-default-900 dark:text-default-300 dark:hover:text-white transition-colors">
                Features
              </a>
              <a href="#dashboards" className="text-default-600 hover:text-default-900 dark:text-default-300 dark:hover:text-white transition-colors">
                Dashboards
              </a>
              <a href="#components" className="text-default-600 hover:text-default-900 dark:text-default-300 dark:hover:text-white transition-colors">
                Components
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/en">
                <Button color="primary" size="md">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-default-900 dark:text-white leading-tight">
                Build Amazing
                <span className="text-primary block">
                  Admin Dashboards
                </span>
              </h1>
              <p className="mt-6 text-lg text-default-600 dark:text-default-300 max-w-2xl">
                DashCode is a comprehensive admin dashboard template built with Next.js, TypeScript, and Tailwind CSS. 
                Create powerful analytics, e-commerce, and project management dashboards with ease.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/en">
                  <Button color="primary" size="lg" className="w-full sm:w-auto">
                    Get Started
                    <Icon icon="heroicons:arrow-right" className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Demo
                  <Icon icon="heroicons:play" className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/images/auth/ils1.svg"
                  alt="Dashboard Preview"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg shadow-2xl"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-info/20 rounded-lg blur-3xl transform scale-110"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-default-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-default-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-default-600 dark:text-default-300 max-w-2xl mx-auto">
              Everything you need to build modern admin dashboards and web applications
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon icon="heroicons:chart-bar" className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Comprehensive analytics with beautiful charts, revenue tracking, and performance metrics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon icon="heroicons:shopping-cart" className="w-6 h-6 text-success" />
                </div>
                <CardTitle className="text-xl">E-commerce Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete e-commerce solution with product management, orders, and customer analytics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon icon="heroicons:document" className="w-6 h-6 text-info" />
                </div>
                <CardTitle className="text-xl">Project Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Task management, team collaboration, and project tracking tools built-in.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon icon="heroicons:language" className="w-6 h-6 text-warning" />
                </div>
                <CardTitle className="text-xl">Multi-language</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built-in internationalization support with RTL languages and easy translation management.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon icon="heroicons:shield-check" className="w-6 h-6 text-destructive" />
                </div>
                <CardTitle className="text-xl">Secure Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  NextAuth.js integration with multiple providers, JWT sessions, and protected routes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon icon="heroicons:device-phone-mobile" className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Responsive Design</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Mobile-first design that works perfectly on all devices and screen sizes.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Types Section */}
      <section id="dashboards" className="py-20 bg-default-50 dark:bg-default-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-default-900 dark:text-white mb-4">
              Multiple Dashboard Types
            </h2>
            <p className="text-lg text-default-600 dark:text-default-300 max-w-2xl mx-auto">
              Choose from various pre-built dashboard layouts for different business needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-default-900 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <Icon icon="heroicons:chart-pie" className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-default-900 dark:text-white mb-2">Analytics</h3>
              <p className="text-sm text-default-600 dark:text-default-300">Revenue tracking and performance metrics</p>
            </div>
            <div className="bg-white dark:bg-default-900 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <Icon icon="heroicons:credit-card" className="w-8 h-8 text-success mx-auto mb-4" />
              <h3 className="font-semibold text-default-900 dark:text-white mb-2">Banking</h3>
              <p className="text-sm text-default-600 dark:text-default-300">Financial management and transactions</p>
            </div>
            <div className="bg-white dark:bg-default-900 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <Icon icon="heroicons:shopping-bag" className="w-8 h-8 text-info mx-auto mb-4" />
              <h3 className="font-semibold text-default-900 dark:text-white mb-2">E-commerce</h3>
              <p className="text-sm text-default-600 dark:text-default-300">Online store and product management</p>
            </div>
            <div className="bg-white dark:bg-default-900 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <Icon icon="heroicons:users" className="w-8 h-8 text-warning mx-auto mb-4" />
              <h3 className="font-semibold text-default-900 dark:text-white mb-2">CRM</h3>
              <p className="text-sm text-default-600 dark:text-default-300">Customer relationship management</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are building amazing dashboards with DashCode
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/en">
              <Button color="secondary" size="lg" className="w-full sm:w-auto">
                Start Building Now
                <Icon icon="heroicons:rocket-launch" className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
              View Documentation
              <Icon icon="heroicons:book-open" className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-default-900 border-t border-default-200 dark:border-default-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Logo />
              <p className="mt-4 text-default-600 dark:text-default-300 max-w-md">
                DashCode is a modern admin dashboard template built with the latest technologies 
                to help you create powerful web applications.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-default-900 dark:text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-default-600 dark:text-default-300 hover:text-primary">Features</a></li>
                <li><a href="#" className="text-default-600 dark:text-default-300 hover:text-primary">Dashboards</a></li>
                <li><a href="#" className="text-default-600 dark:text-default-300 hover:text-primary">Components</a></li>
                <li><a href="#" className="text-default-600 dark:text-default-300 hover:text-primary">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-default-900 dark:text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-default-600 dark:text-default-300 hover:text-primary">Help Center</a></li>
                <li><a href="#" className="text-default-600 dark:text-default-300 hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="text-default-600 dark:text-default-300 hover:text-primary">Community</a></li>
                <li><a href="#" className="text-default-600 dark:text-default-300 hover:text-primary">Updates</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-default-200 dark:border-default-700 mt-12 pt-8 text-center">
            <Copyright />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;