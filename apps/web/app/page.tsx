import React from "react"
import Link from "next/link"
import { MessageSquare, Gamepad2, ArrowRight } from "lucide-react"
import {ThemeSwitcher} from "@repo/theme"
import FeatureCard from "./components/FeatureCard"
import HowItWorksStep from "./components/HowItWorksStep"

const HomePage: React.FC = () => {
  const features = [
    {
      title: "Twitch Chat Integration",
      description: "Connect to Twitch channels and chat in real-time with full IRC support",
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      link: "/chat",
    },
    {
      title: "Interactive Games",
      description: "Play interactive games that integrate with your Twitch chat",
      icon: <Gamepad2 className="h-10 w-10 text-accent" />,
      link: "/games",
    },
    {
      title: "Theme Customization",
      description: "Choose from multiple themes to personalize your experience",
      icon: (
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent rounded-full opacity-80"></div>
          <div className="absolute inset-1 bg-background rounded-full"></div>
        </div>
      ),
      link: null,
      component: <ThemeSwitcher className="mt-4" />,
    },
  ]

  const howItWorksSteps = [
    {
      number: 1,
      title: "Connect to Twitch",
      description:
        "Join your favorite Twitch channels using our IRC client integration. Simply enter a channel name and start chatting.",
      bgColor: "bg-primary",
    },
    {
      number: 2,
      title: "Interact with Chat",
      description:
        "View messages in real-time with full support for Twitch emotes, badges, and chat commands. Filter messages and search through chat history.",
      bgColor: "bg-secondary",
    },
    {
      number: 3,
      title: "Play Interactive Games",
      description:
        "Launch games that integrate with your Twitch chat, allowing viewers to participate directly through chat commands.",
      bgColor: "bg-accent",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent rounded-full filter blur-3xl opacity-50"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Twitch Chat Interactive
            </h1>
            <p className="text-xl text-text-secondary mb-10 leading-relaxed">
              Connect to Twitch, chat with your community, and play interactive games - all in one
              place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/chat"
                className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-colors"
              >
                Open Chat
              </Link>
              <Link
                href="/games"
                className="px-8 py-3 rounded-lg bg-surface hover:bg-surface-hover border border-primary/20 font-medium transition-colors"
              >
                Explore Games
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                link={feature.link}
                component={feature.component}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {howItWorksSteps.map((step, index) => (
                <HowItWorksStep
                  key={index}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  bgColor={step.bgColor}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-background-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            Join the fun today and connect with your favorite Twitch communities.
          </p>
          <Link
            href="/chat"
            className="px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-colors inline-flex items-center"
          >
            Open Chat Client <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background-tertiary border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Twitch Chat Interactive
              </h2>
            </div>
            <div className="flex gap-6">
              <Link href="/" className="text-text-secondary hover:text-text transition-colors">
                Home
              </Link>
              <Link href="/chat" className="text-text-secondary hover:text-text transition-colors">
                Chat
              </Link>
              <Link href="/games" className="text-text-secondary hover:text-text transition-colors">
                Games
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-text-tertiary text-sm">
            &copy; {new Date().getFullYear()} Twitch Chat Interactive. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
