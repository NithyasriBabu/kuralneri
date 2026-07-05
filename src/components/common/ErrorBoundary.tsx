import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import type { ErrorInfo } from 'react';
import { NATIVE_THEME_COLORS } from 'src/theme/nativeTheme.constants';

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((props: ErrorBoundaryFallbackProps) => React.ReactNode);
  resetKeys?: ReadonlyArray<unknown>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export interface ErrorFallbackProps extends ErrorBoundaryFallbackProps {
  title: string;
  message: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

function areResetKeysEqual(
  previousKeys: ReadonlyArray<unknown> | undefined,
  nextKeys: ReadonlyArray<unknown> | undefined,
): boolean {
  if (previousKeys === nextKeys) return true;
  if (!previousKeys || !nextKeys) return false;
  if (previousKeys.length !== nextKeys.length) return false;

  return previousKeys.every((value, index) => Object.is(value, nextKeys[index]));
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  title,
  message,
  primaryActionLabel,
  secondaryActionLabel,
  onSecondaryAction,
}: ErrorFallbackProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = React.useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={styles.shell}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.detail}>{error.message}</Text>

        <View style={styles.actions}>
          {secondaryActionLabel && onSecondaryAction ? (
            <Pressable
              accessibilityRole="button"
              onPress={onSecondaryAction}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>{secondaryActionLabel}</Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={resetErrorBoundary}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>{primaryActionLabel}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (!this.state.error) return;
    if (areResetKeysEqual(prevProps.resetKeys, this.props.resetKeys)) return;

    this.props.onReset?.();
    this.setState({ error: null });
  }

  private resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') {
        return fallback({ error, resetErrorBoundary: this.resetErrorBoundary });
      }
      if (fallback) return fallback;

      return (
        <ErrorFallback
          {...DEFAULT_FALLBACK}
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

const DEFAULT_FALLBACK: Omit<ErrorFallbackProps, keyof ErrorBoundaryFallbackProps> = {
  title: 'Something went wrong',
  message: 'The app hit an unexpected error.',
  primaryActionLabel: 'Try again',
};

function createStyles(isDark: boolean) {
  const palette = isDark ? NATIVE_THEME_COLORS.dark : NATIVE_THEME_COLORS.light;

  return StyleSheet.create({
    shell: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 520,
      borderRadius: 16,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: isDark ? 0.22 : 0.08,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 2,
    } as ViewStyle,
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: palette.title,
      marginBottom: 8,
    } as TextStyle,
    message: {
      fontSize: 15,
      lineHeight: 22,
      color: palette.body,
      marginBottom: 10,
    } as TextStyle,
    detail: {
      fontSize: 13,
      lineHeight: 18,
      color: isDark ? palette.secondary : palette.primarySoft,
      marginBottom: 16,
    } as TextStyle,
    actions: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
    },
    primaryButton: {
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.primary,
    },
    primaryButtonText: {
      color: palette.primaryInverse,
      fontSize: 14,
      fontWeight: '700',
    } as TextStyle,
    secondaryButton: {
      minHeight: 44,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: palette.borderAccent,
    },
    secondaryButtonText: {
      color: isDark ? palette.title : palette.primary,
      fontSize: 14,
      fontWeight: '700',
    } as TextStyle,
    pressed: {
      opacity: 0.85,
    },
  });
}
