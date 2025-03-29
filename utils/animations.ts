import { Variants } from 'framer-motion';

export const transitionProps = {
  duration: 0.5,
  ease: [0.43, 0.13, 0.23, 0.96]
};

export const springProps = {
  stiffness: 200,
  damping: 20
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "tween", ...transitionProps }
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      type: "tween"
    }
  }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: "spring", ...springProps }
};

export const slideIn: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { type: "tween", ...transitionProps }
};

export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
};
