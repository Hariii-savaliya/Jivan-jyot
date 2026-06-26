import React from 'react';
import ScrollReveal from './ScrollReveal';

export default function SectionHeader({ title, description, align = 'center' }) {
  return (
    <ScrollReveal className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">{title}</h2>
      {description && (
        <p className="text-muted-foreground max-w-2xl leading-relaxed text-base sm:text-lg mx-auto">
          {description}
        </p>
      )}
    </ScrollReveal>
  );
}