import { cn } from 'src/lib/utils';
import * as React from 'react';
import { Platform, TextInput } from 'react-native';

type InputProps = React.ComponentProps<typeof TextInput> &
  React.RefAttributes<TextInput> & {
    // Native has no `aria-invalid:` pseudo-class — pass this to show the destructive border (e.g. react-hook-form's fieldState.invalid)
    invalid?: boolean;
  };

function Input({ className, invalid, onFocus, onBlur, ...props }: InputProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <TextInput
      onFocus={(e) => {
        setIsFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        onBlur?.(e);
      }}
      className={cn(
        'dark:bg-input/30 border-input bg-background text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-md border px-3 py-1 text-base leading-5 shadow-sm shadow-black/5 sm:h-9',
        // `focus-visible:`/`aria-invalid:` below are web-only — these two cover the same states on iOS/Android
        isFocused && 'border-brand',
        invalid && 'border-destructive',
        props.editable === false &&
        cn(
          'opacity-50',
          Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
        ),
        Platform.select({
          web: cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
          ),
          native: 'placeholder:text-muted-foreground/50',
        }),
        className
      )}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
