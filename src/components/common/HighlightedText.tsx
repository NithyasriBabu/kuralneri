import React from 'react';

import { KuralText } from 'src/components/common/KuralText';
import { useTheme } from 'src/theme/ThemeContextProvider';

interface HighlightedTextProps extends React.ComponentProps<typeof KuralText> {
  text: string;
  query?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function HighlightedText({ text, query, ...props }: HighlightedTextProps) {
  const { theme } = useTheme();
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) return <KuralText {...props}>{text}</KuralText>;

  const matcher = new RegExp(`(${escapeRegExp(normalizedQuery)})`, 'gi');
  const parts = text.split(matcher);

  return (
    <KuralText {...props}>
      {parts.map((part, index) =>
        part.toLocaleLowerCase() === normalizedQuery.toLocaleLowerCase() ? (
          <KuralText
            key={`${part}-${index}`}
            style={{ backgroundColor: theme.colors.accent, color: theme.colors.textPrimary }}
          >
            {part}
          </KuralText>
        ) : (
          part
        ),
      )}
    </KuralText>
  );
}
