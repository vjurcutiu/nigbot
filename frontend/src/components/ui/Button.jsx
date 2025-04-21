// frontend/src/components/ui/Button.jsx
import React from 'react';
import classNames from 'classnames';

/**
 * Basic Button with two variants: default (solid) and outline
 * Props:
 * - variant: 'default' | 'outline'
 * - className: additional Tailwind classes
 * - ...props: any button element props
 */
export function Button({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  const baseStyles = 'px-4 py-2 rounded-2xl font-medium transition';
  const variantStyles = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50',
  };

  return (
    <button
      className={classNames(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}