"use client";

// Revelação suave ao rolar a página — usada só na landing (§15): o painel
// interno prioriza velocidade percebida, não teatro visual.
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduzMotion = useReducedMotion();

  const variants: Variants = {
    hidden: reduzMotion ? { opacity: 1 } : { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE } },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
