'use client'

import { motion } from 'framer-motion'
import { FaCheck, FaTimes } from 'react-icons/fa'

interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: {
    text: string
    included: boolean
  }[]
  buttonText: string
  isPopular?: boolean
  isComingSoon?: boolean
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Basic',
    price: 'Free',
    period: '',
    description: 'Perfect for getting started',
    features: [
      { text: '1 Duvet tracking', included: true },
      { text: 'AI mite detection', included: true },
      { text: 'Weather integration', included: true },
      { text: 'Community helpers', included: true },
      { text: 'Unlimited duvet tracking', included: false },
      { text: 'Priority support', included: false },
    ],
    buttonText: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious mite fighters',
    features: [
      { text: 'Unlimited duvet tracking', included: true },
      { text: 'AI mite detection', included: true },
      { text: 'Weather integration', included: true },
      { text: 'Community helpers', included: true },
      { text: 'Priority support', included: true },
      { text: 'Advanced analytics', included: true },
    ],
    buttonText: 'Coming Soon',
    isPopular: true,
    isComingSoon: true,
  },
]

export default function PricingSection() {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {pricingPlans.map((plan, index) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`relative bg-white rounded-2xl shadow-lg border ${
            plan.isPopular ? 'border-blue-500 border-2' : 'border-gray-200'
          } p-8`}
        >
          {plan.isPopular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
          )}
          
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
              {plan.period && (
                <span className="text-gray-600 ml-2">{plan.period}</span>
              )}
            </div>
          </div>
          
          <ul className="space-y-4 mb-8">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-center">
                {feature.included ? (
                  <FaCheck className="text-green-500 w-5 h-5 mr-3 flex-shrink-0" />
                ) : (
                  <FaTimes className="text-gray-300 w-5 h-5 mr-3 flex-shrink-0" />
                )}
                <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
          
          <button
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
              plan.isComingSoon
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : plan.isPopular
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
            disabled={plan.isComingSoon}
          >
            {plan.buttonText}
          </button>
          
          {plan.isComingSoon && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Stripe integration coming soon!
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}