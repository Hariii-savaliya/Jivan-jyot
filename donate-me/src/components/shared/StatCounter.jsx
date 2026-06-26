import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function StatCounter({ value, label, icon: Icon, suffix = '+' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const stepTime = Math.max(Math.floor(duration / value), 16);
    const timer = setInterval(() => {
      start += Math.ceil(value / (duration / stepTime));
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center p-6"
    >
      <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-secondary" />
      </div>
      <div className="font-display text-4xl font-bold text-foreground mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </motion.div>
  );
}