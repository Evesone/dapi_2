import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { ArrowRight, Brush, Image as ImageIcon, Rocket } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full text-center py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
        <div className="container mx-auto px-4 z-10 relative">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-4">
            Wear Your Imagination
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Turn your ideas into unique, custom-designed apparel. With DAPI, you bring the vision, and our AI brings it to life.
          </p>
          <Button size="lg" asChild>
            <Link href="/design">
              Start Designing <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-16 lg:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Why Choose DAPI?</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
              We provide powerful tools to make your design process seamless and fun.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-transparent border-border/50">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                  <Rocket className="w-8 h-8" />
                </div>
                <CardTitle className="font-headline mt-4">AI-Powered Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Leverage state-of-the-art AI to generate stunning, one-of-a-kind designs from simple text prompts and images.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center bg-transparent border-border/50">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                  <Brush className="w-8 h-8" />
                </div>
                <CardTitle className="font-headline mt-4">Infinite Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose from various clothing types, styles, and colors. Your vision is the only limit.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center bg-transparent border-border/50">
              <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <CardTitle className="font-headline mt-4">Live Mockup Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Instantly see your creation on a high-quality mockup, ensuring it's perfect before you order.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Create in 3 Simple Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 -z-10 hidden md:block"></div>
             <div className="absolute top-0 left-1/2 w-0.5 h-full bg-border -translate-x-1/2 -z-10 md:hidden"></div>
            <div className="flex flex-col items-center p-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4 border-4 border-background">1</div>
              <h3 className="text-xl font-headline font-semibold mb-2">Describe</h3>
              <p className="text-muted-foreground">
                Enter a text prompt, upload an image, and select your clothing type and style.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4 border-4 border-background">2</div>
              <h3 className="text-xl font-headline font-semibold mb-2">Generate</h3>
              <p className="text-muted-foreground">
                Our AI generates unique design ideas based on your input in seconds.
              </p>
            </div>
            <div className="flex flex-col items-center p-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4 border-4 border-background">3</div>
              <h3 className="text-xl font-headline font-semibold mb-2">Wear</h3>
              <p className="text-muted-foreground">
                Add your favorite design to the cart and we'll print and ship it to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="w-full py-16 lg:py-24 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Loved by Creatives</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-transparent border-border/50">
              <CardContent className="pt-6">
                <blockquote className="text-muted-foreground">
                  "I've never felt so creative! DAPI made it incredibly easy to bring my T-shirt idea to life. The quality is amazing too."
                </blockquote>
                <div className="flex items-center mt-4">
                  <Avatar>
                    <AvatarImage src="https://via.placeholder.com/40x40/6366f1/ffffff?text=J" alt="@jess" data-ai-hint="person face" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold">Jessica Doe</p>
                    <p className="text-sm text-muted-foreground">Independent Artist</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-transparent border-border/50">
              <CardContent className="pt-6">
                <blockquote className="text-muted-foreground">
                  "As a developer, I love the tech behind this. The AI suggestions were spot on. I'm already planning my next hoodie design."
                </blockquote>
                <div className="flex items-center mt-4">
                  <Avatar>
                    <AvatarImage src="https://via.placeholder.com/40x40/10b981/ffffff?text=M" alt="@mike" data-ai-hint="man portrait" />
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold">Mike Ross</p>
                    <p className="text-sm text-muted-foreground">Software Engineer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
