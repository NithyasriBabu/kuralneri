import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  container: {
    padding: 12,
    backgroundColor: '#f5f5f3',
    borderBottomWidth: 1,
    borderColor: '#e0e0d8',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownContainer: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  flexItem: {
    flex: 1,
    minWidth: 200,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    height: 44,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 44,
    backgroundColor: 'transparent',
  },
  disabledPicker: {
    backgroundColor: '#eaeaea',
    opacity: 0.6,
  },
  counterText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#7f8c8d',
    fontSize: 15,
    textAlign: 'center',
  },
  footer: {
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    gap: 8,
  },
  footerRange: {
    fontSize: 12,
    color: '#555',
  },
  paginationRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activePageButton: {
    backgroundColor: '#2c3e50',
    borderColor: '#2c3e50',
  },
  pageText: {
    fontSize: 13,
    color: '#333',
  },
  activePageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fieldGroup: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  disabledLabel: {
    color: '#a0aec0',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#eaeaea',
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
  },
  filterBadge: {
    backgroundColor: '#344e41',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  accordionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chevronIcon: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  collapsibleContent: {
    padding: 16,
    gap: 16,
  },
  clearButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  clearButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 13,
  },
});

export const kuralCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#A3B18A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  kuralNumber: {
    color: '#3A5A40',
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 12,
  },
  tamilText: {
    fontFamily: 'MuktaMalar_400Regular',
    fontSize: 18,
    color: '#344E41',
    lineHeight: 26,
  },
  translationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#344E41',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export const navStyles = StyleSheet.create({
  // Global Shell Bar Settings (Dark Forest Green)
  navbarContainer: {
    flexDirection: 'row',
    backgroundColor: '#344E41',
    width: '100%',
    height: 64,
  },

  // Placement Overrides
  topPlacement: {
    borderBottomWidth: 2,
    borderColor: '#2A3F34',
  },
  bottomPlacement: {
    borderTopWidth: 2,
    borderColor: '#2A3F34',
    height: 76,
    paddingBottom: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: 'transparent',
  },

  activeTabButton: {
    backgroundColor: '#A3B18A',
    borderBottomWidth: 4,
    borderBottomColor: '#344E41',
  },
  tabText: {
    color: '#FAF9F6',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  activeTabText: {
    color: '#344E41',
    fontWeight: '800',
    opacity: 1,
  },
  canvasWrapper: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    width: '100%',
  },
  fullWidthColumn: {
    width: '100%',
    flex: 1,
  },
});
