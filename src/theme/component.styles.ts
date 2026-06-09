import { StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';
import { AppTheme } from 'src/theme/types';

export const createComponentStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    /* ==========================================================================
       KURAL CARD COMPONENT SURFACE
       ========================================================================== */
    kuralCard: {
      position: 'relative',
      backgroundColor: theme.colors.interactive.card.default,
      padding: 20,
      borderRadius: theme.layout.borderRadius.large,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.colors.surface,
      // Shared shadow token properties from the previous setup
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    } as ViewStyle,
    kuralCardPressable: {
      gap: 10,
      paddingRight: 42,
    } as ViewStyle,
    kuralCardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    } as ViewStyle,
    kuralCardHeaderText: {
      flex: 1,
      paddingRight: 8,
    } as ViewStyle,
    kuralCardBookmarkButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
    } as ViewStyle,
    kuralCardBookmarkButtonActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    } as ViewStyle,
    kuralCardBookmarkButtonDisabled: {
      opacity: 0.5,
    } as ViewStyle,
    kuralCardNumber: {
      color: theme.colors.textSecondary,
      fontWeight: 'bold',
      marginBottom: 5,
      fontSize: theme.typography.sizes.caption,
    } as TextStyle,
    kuralCardTamil: {
      fontFamily: theme.typography.fonts.tamil,
      fontSize: theme.typography.sizes.bodyLarge,
      color: theme.colors.textPrimary,
      lineHeight: 26,
    } as TextStyle,
    kuralCardTranslation: {
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.bodyNormal,
      color: theme.colors.textPrimary,
      marginTop: 10,
      fontStyle: 'italic',
    } as TextStyle,

    // Commentary blocks inside deep inspection windows
    commentaryDivider: {
      height: 1,
      backgroundColor: theme.colors.surface,
      marginVertical: 12,
    } as ViewStyle,
    commentaryNoteBlock: {
      marginBottom: 12,
      backgroundColor: theme.colors.surfaceElevated,
      padding: 10,
      borderRadius: theme.layout.borderRadius.small,
    } as ViewStyle,
    userNotesSection: {
      marginTop: 16,
    } as ViewStyle,
    userNotesTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      gap: 8,
    } as ViewStyle,
    userNotesTitle: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: theme.typography.sizes.caption + 2,
    } as TextStyle,
    userNotesEditorCard: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.layout.borderRadius.medium,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 10,
    } as ViewStyle,
    userNotesInput: {
      minHeight: 96,
      textAlignVertical: 'top',
      paddingTop: 12,
    } as TextStyle,
    userNotesActionsRow: {
      flexDirection: 'row',
      gap: 10,
      flexWrap: 'wrap',
    } as ViewStyle,
    userNotesHistoryList: {
      marginTop: 12,
      gap: 10,
    } as ViewStyle,
    userNotesHistoryItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.layout.borderRadius.small,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    } as ViewStyle,
    userNotesHistoryMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
      gap: 8,
    } as ViewStyle,
    userNotesHistoryDate: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.sizes.caption,
      fontWeight: '700',
    } as TextStyle,
    userNotesHistoryBody: {
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.bodyNormal,
      lineHeight: 22,
    } as TextStyle,
    userNotesEmptyText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.sizes.caption + 1,
      fontStyle: 'italic',
    } as TextStyle,

    /* ==========================================================================
       KURAL OF THE DAY VIEW SURFACE
       ========================================================================== */
    kuralOfTheDayScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    } as ViewStyle,
    kuralOfTheDayContent: {
      padding: theme.layout.screenPadding + 4,
    } as ViewStyle,
    kuralOfTheDayHeader: {
      marginBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.accent,
      paddingBottom: 8,
    } as ViewStyle,
    kuralOfTheDayTamilHeader: {
      fontFamily: theme.typography.fonts.tamil,
      fontSize: 22,
      color: theme.colors.primary,
    } as TextStyle,
    kuralOfTheDayEnglishHeader: {
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.caption + 2,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: 2,
    } as TextStyle,
    kuralOfTheDayFeedWrapper: {
      marginTop: 8,
    } as ViewStyle,
    kuralOfTheDayCentered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    } as ViewStyle,
    kuralOfTheDayErrorText: {
      color: theme.colors.error,
      textAlign: 'center',
      fontSize: theme.typography.sizes.bodyNormal - 1,
      fontFamily: theme.typography.fonts.english,
    } as TextStyle,

    /* ==========================================================================
       FILTER TRY & ACCORDION MECHANICS (Added missing properties)
       ========================================================================== */
    accordionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.layout.borderRadius.medium,
    } as ViewStyle,
    accordionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    } as ViewStyle,
    accordionTitle: {
      fontSize: theme.typography.sizes.bodyNormal,
      fontWeight: '700',
      color: theme.colors.primary,
    } as TextStyle,
    accordionRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    } as ViewStyle,
    chevronIcon: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    } as TextStyle,
    collapsibleContent: {
      padding: 16,
      gap: theme.layout.gridGap,
    } as ViewStyle,
    filterBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 2,
    } as ViewStyle,
    filterBadgeText: {
      color: theme.colors.surfaceElevated,
      fontSize: 11,
      fontWeight: 'bold',
    } as TextStyle,
    counterText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    } as TextStyle,
    clearButton: {
      paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.layout.borderRadius.medium,
      height: theme.layout.minHeights.input,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    } as ViewStyle,
    clearButtonText: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
      fontSize: 13,
    } as TextStyle,

    /* ==========================================================================
       GENERIC EMPTY / FEATURE PLACEHOLDERS
       ========================================================================== */
    featurePlaceholderShell: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.layout.screenPadding * 2,
    } as ViewStyle,
    featurePlaceholderCard: {
      width: '100%',
      maxWidth: 520,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.layout.borderRadius.large,
      padding: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
    } as ViewStyle,
    featurePlaceholderIcon: {
      fontSize: 32,
      marginBottom: 12,
      textAlign: 'center',
    } as TextStyle,
    featurePlaceholderTitle: {
      fontFamily: theme.typography.fonts.tamil,
      fontSize: theme.typography.sizes.h2,
      color: theme.colors.primary,
      textAlign: 'center',
    } as TextStyle,
    featurePlaceholderSubtitle: {
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.caption + 2,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      textAlign: 'center',
      marginTop: 4,
    } as TextStyle,
    featurePlaceholderBody: {
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.bodyNormal,
      color: theme.colors.textPrimary,
      lineHeight: 22,
      textAlign: 'center',
      marginTop: 14,
    } as TextStyle,
    themeToggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      alignSelf: 'flex-end',
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.layout.borderRadius.large,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    } as ViewStyle,
    themeToggleIcon: {
      fontSize: 14,
      color: theme.colors.primary,
    } as TextStyle,
    themeToggleTextGroup: {
      flexDirection: 'column',
    } as ViewStyle,
    themeToggleLabel: {
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.caption - 1,
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    } as TextStyle,
    themeToggleValue: {
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.bodyNormal - 1,
      color: theme.colors.textPrimary,
      fontWeight: '700',
    } as TextStyle,

    /* ==========================================================================
       KURAL LIST VIEW / PAGINATION RIBBON
       ========================================================================== */
    kuralListScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    } as ViewStyle,
    kuralListPadding: {
      paddingHorizontal: 10,
      paddingBottom: 165,
    } as ViewStyle,
    kuralListCardWrapper: {
      paddingHorizontal: 8,
      marginVertical: 4,
    } as ViewStyle,
    kuralListGridColumnFull: {
      flex: 1,
    } as ViewStyle,
    kuralListGridColumnHalf: {
      flex: 0.5,
    } as ViewStyle,
    kuralListGridColumnThird: {
      flex: 0.333,
    } as ViewStyle,
    kuralListCenteredLoader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    kuralListPaginationContainer: {
      backgroundColor: theme.colors.background,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: theme.layout.borderRadius.large,
      borderTopRightRadius: theme.layout.borderRadius.large,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 24 : 16,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
    } as ViewStyle,
    kuralListRibbonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: 10,
    } as ViewStyle,
    kuralListStepperButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    kuralListStepperButtonDisabled: {
      backgroundColor: theme.colors.border,
      opacity: 0.3,
    } as ViewStyle,
    kuralListStepperButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      lineHeight: Platform.OS === 'ios' ? 24 : 28,
    } as TextStyle,
    kuralListNumberScrollView: {
      flex: 1,
      marginHorizontal: 8,
    } as ViewStyle,
    kuralListNumberRowPadding: {
      paddingHorizontal: 4,
      flexGrow: 1,
      justifyContent: 'center',
    } as ViewStyle,
    kuralListNumberButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 4,
    } as ViewStyle,
    kuralListNumberButtonActive: {
      backgroundColor: theme.colors.accent,
    } as ViewStyle,
    kuralListNumberText: {
      fontFamily: theme.typography.fonts.english,
      color: theme.colors.textPrimary,
      fontSize: theme.typography.sizes.caption + 2,
      fontWeight: '600',
    } as TextStyle,
    kuralListNumberTextActive: {
      color: theme.colors.textPrimary,
      fontWeight: 'bold',
    } as TextStyle,
    kuralListMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginTop: 6,
    } as ViewStyle,
    kuralListMetaColumnLeft: {
      flex: 1,
      alignItems: 'flex-start',
    } as ViewStyle,
    kuralListMetaColumnCenter: {
      flex: 1,
      alignItems: 'center',
    } as ViewStyle,
    kuralListMetaColumnRight: {
      flex: 1,
      alignItems: 'flex-end',
    } as ViewStyle,
    kuralListMetaText: {
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.bodyNormal - 1,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    } as TextStyle,
    kuralListBadgeCluster: {
      flexDirection: 'row',
      alignItems: 'center',
    } as ViewStyle,
    kuralListLimitTitleText: {
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.bodyNormal - 2,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      marginRight: 6,
    } as TextStyle,
    kuralListLimitBadge: {
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginLeft: 4,
      minWidth: 30,
      alignItems: 'center',
    } as ViewStyle,
    kuralListLimitBadgeActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    } as ViewStyle,
    kuralListLimitBadgeText: {
      fontFamily: theme.typography.fonts.english,
      fontSize: theme.typography.sizes.caption - 1,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
    } as TextStyle,
    kuralListLimitBadgeTextActive: {
      color: theme.colors.textPrimary,
    } as TextStyle,

    /* ==========================================================================
       NAVIGATION / SHELL LAYOUTS
       ========================================================================== */
    navbarShell: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      width: '100%',
      height: 64,
    } as ViewStyle,
    navbarTopOverride: {
      borderBottomWidth: 2,
      borderColor: theme.colors.border,
    } as ViewStyle,
    navbarBottomOverride: {
      borderTopWidth: 2,
      borderColor: theme.colors.border,
      height: 76,
      paddingBottom: 12,
    } as ViewStyle,
    tabItemButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    } as ViewStyle,
    tabItemButtonActive: {
      backgroundColor: theme.colors.accent,
    } as ViewStyle,
    tabItemText: {
      color: theme.dark ? theme.colors.textPrimary : theme.colors.surfaceElevated,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      opacity: 0.7,
    } as TextStyle,
    tabItemTextActive: {
      color: theme.dark ? theme.colors.background : theme.colors.primary,
      fontWeight: '800',
      opacity: 1,
    } as TextStyle,

    navShell: {
      flex: 1,
      backgroundColor: theme.colors.background,
    } as ViewStyle,
    navNavbarContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      width: '100%',
      height: 64,
    } as ViewStyle,
    navTopPlacement: {
      borderBottomWidth: 2,
      borderColor: theme.colors.border,
    } as ViewStyle,
    navBottomPlacement: {
      borderTopWidth: 2,
      borderColor: theme.colors.border,
      height: 76,
      paddingBottom: 12,
    } as ViewStyle,
    navTabIcon: {
      fontSize: 16,
      opacity: 0.7,
      color: theme.colors.textPrimary,
    } as TextStyle,
    navTabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      backgroundColor: 'transparent',
    } as ViewStyle,
    navTabButtonActive: {
      backgroundColor: theme.colors.accent,
      borderBottomWidth: 4,
      borderBottomColor: theme.colors.primary,
    } as ViewStyle,
    navTabText: {
      color: theme.colors.textPrimary,
      fontSize: theme.typography.sizes.caption,
      fontWeight: '600',
      marginTop: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      opacity: 0.7,
    } as TextStyle,
    navTabTextActive: {
      color: theme.colors.textPrimary,
      fontWeight: '800',
      opacity: 1,
    } as TextStyle,
    navCanvasWrapper: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
    } as ViewStyle,
    navFullWidthColumn: {
      width: '100%',
      flex: 1,
    } as ViewStyle,
    navToggleDock: {
      position: 'absolute',
      top: 12,
      right: 12,
      zIndex: 20,
    } as ViewStyle,

    /* ==========================================================================
       FEED PAGINATION & COMPACT TELEMETRY RIBBON
       ========================================================================== */
    ribbonContainer: {
      backgroundColor: theme.colors.background,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: theme.layout.borderRadius.large,
      borderTopRightRadius: theme.layout.borderRadius.large,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    } as ViewStyle,
    ribbonScrollRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: 10,
    } as ViewStyle,
    ribbonStepCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    ribbonStepCircleDisabled: {
      backgroundColor: theme.colors.border,
      opacity: 0.3,
    } as ViewStyle,
    ribbonStepText: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: 'bold',
      lineHeight: Platform.OS === 'ios' ? 24 : 28,
    } as TextStyle,
    ribbonNumberPill: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 4,
    } as ViewStyle,
    ribbonNumberPillActive: {
      backgroundColor: theme.colors.accent,
    } as ViewStyle,
    ribbonNumberText: {
      fontFamily: theme.typography.fonts.english,
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    } as TextStyle,
    ribbonNumberTextActive: {
      color: theme.colors.textPrimary,
      fontWeight: 'bold',
    } as TextStyle,

    // Three-Column Layout Mechanics
    telemetryColumnLeft: { flex: 1, alignItems: 'flex-start' } as ViewStyle,
    telemetryColumnCenter: { flex: 1, alignItems: 'center' } as ViewStyle,
    telemetryColumnRight: { flex: 1, alignItems: 'flex-end' } as ViewStyle,

    // Limit Pill Components
    badgeControlPill: {
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginLeft: 4,
      minWidth: 30,
      alignItems: 'center',
    } as ViewStyle,
    badgeControlPillActive: {
      backgroundColor: theme.colors.accent,
      borderColor: theme.colors.accent,
    } as ViewStyle,
  });
};
