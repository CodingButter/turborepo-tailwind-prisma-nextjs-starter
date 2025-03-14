import React, { ReactNode } from "react"
import  Link from "next/link"
import { ArrowRight } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  link?: string | null
  component?: ReactNode
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, link, component }) => {
  return (
    <div className="p-6 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary mb-4">{description}</p>
      {link && (
        <Link
          href={link}
          className="inline-flex items-center text-primary hover:text-primary-light font-medium transition-colors"
        >
          Try it now <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      )}
      {/* Render the component if it exists */}
      <div className="w-full flex items-center justify-center">{component}</div>
    </div>
  )
}

export default FeatureCard
