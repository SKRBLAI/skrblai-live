'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: 'Sarah L.',
    testimonial: 'SKRBL AI transformed our marketing strategy!',
    rating: 5
  },
  {
    id: 2,
    name: 'Michael T.',
    testimonial: 'Incredible tools for brand development.',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily R.',
    testimonial: 'Our website automation has never been better!',
    rating: 5
  }
];

export function TestimonialSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center mb-12 text-electric-blue">
        What Our Clients Say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="bg-deep-navy/80 p-8 rounded-xl border border-electric-blue/20"
          >
            <div className="flex mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <p className="text-soft-gray/80 mb-4 italic">"{testimonial.testimonial}"</p>
            <p className="font-bold text-electric-blue">- {testimonial.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 