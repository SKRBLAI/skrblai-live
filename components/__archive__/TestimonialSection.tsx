'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    content: 'SKRBL AI transformed our content creation process. The AI agents are incredibly intuitive and efficient!',
    image: '/images/testimonials/sarah.jpg'
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    content: 'The automation capabilities are game-changing. Our team can now focus on strategy while SKRBL handles execution.',
    image: '/images/testimonials/michael.jpg'
  }
];

export default function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-20 bg-deep-navy/95">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-electric-blue mb-12">
          What Our Clients Say
        </h2>
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-between">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-teal-500 hover:bg-teal-400 text-white transition-colors z-10"
              title="Previous testimonial"
              aria-label="Previous testimonial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-teal-500 hover:bg-teal-400 text-white transition-colors z-10"
              title="Next testimonial"
              aria-label="Next testimonial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-deep-navy/90 backdrop-blur-md rounded-xl p-8 shadow-2xl border border-electric-blue/20 transform transition-transform duration-500 hover:scale-105"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <Image
                src={testimonials[currentIndex].image}
                alt={testimonials[currentIndex].name}
                width={96}
                height={96}
                className="rounded-full object-cover border-4 border-teal-500"
              />
              <p className="text-lg text-gray-300">
                {testimonials[currentIndex].content}
              </p>
              <div>
                <h3 className="text-xl font-semibold text-teal-300">
                  {testimonials[currentIndex].name}
                </h3>
                <p className="text-sm text-gray-400">
                  {testimonials[currentIndex].role}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}