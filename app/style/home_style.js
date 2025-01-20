import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    searchContainer: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      zIndex: 1,
    },
    autocompleteContainer: {
      flex: 0,
      position: 'absolute',
      width: '100%',
      zIndex: 1,
    },
    searchInput: {
      height: 45,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: '#ddd',
      backgroundColor: '#fff',
      paddingHorizontal: 15,
      fontSize: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    searchListView: {
      backgroundColor: '#fff',
      borderRadius: 8,
      marginTop: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    map: {
      width: '100%',
      height: '60%',
    },
    routeDetailsContainer: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: '40%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
    routeHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    routeTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
    },
    routeSummary: {
      marginBottom: 10,
    },
    routeText: {
      fontSize: 16,
      color: '#444',
      marginBottom: 5,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
  
    navigationButton: {
      backgroundColor: '#2196F3',
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 25,
      width: '48%',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    stepsContainer: {
      flex: 1,
      padding: 20,
    },
    stepItem: {
      marginBottom: 15,
      borderRadius: 10,
      overflow: 'hidden',
    },
    transitStep: {
      backgroundColor: '#e3f2fd',
      padding: 15,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: '#2196F3',
    },
    transitLine: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#1976D2',
      marginBottom: 5,
    },
    transitDetail: {
      fontSize: 15,
      color: '#333',
      marginBottom: 3,
    },
    transitTime: {
      fontSize: 14,
      color: '#666',
    },
    walkingStep: {
      backgroundColor: '#f5f5f5',
      padding: 15,
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: '#78909c',
    },
    walkInstruction: {
      fontSize: 15,
      color: '#333',
      marginBottom: 3,
    },
    walkingDuration: {
      fontSize: 14,
      color: '#666',
    },
  });
  
export default styles;