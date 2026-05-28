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
  clearButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
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
