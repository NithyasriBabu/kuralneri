import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppTheme } from 'src/theme/types';

export const createGlobalStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    /* ==========================================================================
       STRUCTURAL CANVAS TEMPLATES & CONTAINERS
       ========================================================================== */
    shell: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: 'center', // Centers web content container view on desktop screens
    } as ViewStyle,

    // Generic context fallback container name used across previous styles
    container: {
      padding: theme.layout.screenPadding,
      backgroundColor: theme.colors.background,
    } as ViewStyle,

    screenContainer: {
      flex: 1,
      width: '100%',
      maxWidth: theme.layout.maxContentWidth, // Caps layout stretching on 4K monitors
      backgroundColor: theme.colors.background,
      padding: theme.layout.screenPadding, // Toggles elegantly between 16px and 32px via context
    } as ViewStyle,

    centeredContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,

    /* ==========================================================================
       CORE LAYOUT PRIMITIVES & RESPONSIVE TRAY FLOWS
       ========================================================================== */
    row: {
      flexDirection: 'row',
    } as ViewStyle,

    column: {
      flexDirection: 'column',
    } as ViewStyle,

    rowCenter: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,

    spaceBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as ViewStyle,

    flexItem: {
      flex: 1,
      minWidth: 200,
    } as ViewStyle,

    // Layout configuration containers for group placement
    dropdownContainer: {
      gap: theme.layout.gridGap,
    } as ViewStyle,

    fieldGroup: {
      flexDirection: 'column',
    } as ViewStyle,

    // Dynamic Filter Row adjustments based on viewport width
    filterBarContainer: {
      flexDirection: theme.layout.isWideScreen ? 'row' : 'column',
      alignItems: theme.layout.isWideScreen ? 'center' : 'stretch',
      gap: theme.layout.gridGap,
      marginBottom: 16,
    } as ViewStyle,

    /* ==========================================================================
       TYPOGRAPHY ELEMENTS
       ========================================================================== */
    mainHeader: {
      fontSize: theme.typography.sizes.h1,
      fontFamily: theme.typography.fonts.tamil, // Maps dynamically to 'MuktaMalar-Bold'
      color: theme.colors.primary,
      marginTop: 15,
      marginBottom: 20,
      textAlign: 'center',
    } as TextStyle,

    sectionTitleTamil: {
      fontFamily: theme.typography.fonts.tamil,
      fontSize: theme.typography.sizes.h2,
      color: theme.colors.primary,
    } as TextStyle,

    sectionTitleEnglish: {
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.caption,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: 2,
    } as TextStyle,

    fieldLabel: {
      fontSize: theme.typography.sizes.caption,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    } as TextStyle,

    disabledLabel: {
      color: theme.colors.disabledText,
    } as TextStyle,

    /* ==========================================================================
       INTERACTIVE SEARCH FIELDS & INPUT SELECTORS
       ========================================================================== */
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      width: '100%',
    } as ViewStyle,

    inputField: {
      flex: 1,
      height: theme.layout.minHeights.input,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.layout.borderRadius.medium,
      paddingHorizontal: 12,
      fontSize: theme.typography.sizes.bodyNormal,
      borderWidth: 1,
      borderColor: theme.colors.surface,
      color: theme.colors.textPrimary,
    } as ViewStyle,

    pickerWrapper: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.layout.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.surface,
      overflow: 'hidden',
      height: theme.layout.minHeights.input,
      justifyContent: 'center',
    } as ViewStyle,

    pickerPrimitive: {
      width: '100%',
      height: theme.layout.minHeights.input,
      backgroundColor: 'transparent',
    } as ViewStyle,

    disabledPicker: {
      backgroundColor: theme.colors.interactive.card.disabled,
      opacity: 0.6,
    } as ViewStyle,

    /* ==========================================================================
       ADAPTIVE GRID COLUMN SPATIAL SYSTEMS
       ========================================================================== */
    gridColumnFull: { flex: 1 } as ViewStyle,
    gridColumnHalf: { flex: 0.5 } as ViewStyle,
    gridColumnThird: { flex: 0.333 } as ViewStyle,

    // Responsive Adaptive Grid Column
    gridColumnAdaptive: {
      // Shared space evenly across wide rows, stacks full width on mobile viewports
      flex: theme.layout.isWideScreen ? 1 : undefined,
      width: theme.layout.isWideScreen ? undefined : '100%',
    } as ViewStyle,
  });
};
