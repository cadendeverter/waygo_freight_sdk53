import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, List, Card, useTheme, ActivityIndicator } from 'react-native-paper';

interface AddressSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddressAutocompleteProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onAddressSelected: (address: AddressComponents) => void;
  placeholder?: string;
  style?: any;
  mode?: 'outlined' | 'flat';
}

// Production Google Places API (New) implementation
const GOOGLE_PLACES_API_KEY = 'AIzaSyBc8cRFs_nz92HwF5I773A_iBetdr_vVWw';

const placesSearch = async (query: string): Promise<AddressSuggestion[]> => {
  try {
    // Using Places API (New) - Text Search endpoint
    const url = `https://places.googleapis.com/v1/places:searchText`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
      },
      body: JSON.stringify({
        textQuery: query,
        locationRestriction: {
          rectangle: {
            low: { latitude: 25.0, longitude: -125.0 },
            high: { latitude: 49.0, longitude: -66.0 }
          }
        },
        maxResultCount: 10
      })
    });
    
    const data = await response.json();
    
    if (!data.places) {
      console.log('No places found');
      return [];
    }
    
    return data.places.map((place: any) => ({
      place_id: place.id,
      description: place.formattedAddress || place.displayName?.text,
      structured_formatting: {
        main_text: place.displayName?.text || '',
        secondary_text: place.formattedAddress || ''
      }
    }));
  } catch (error) {
    console.error('Google Places API (New) error:', error);
    return [];
  }
};

const getPlaceDetails = async (placeId: string): Promise<AddressComponents> => {
  try {
    // Using Places API (New) - Place Details endpoint
    const url = `https://places.googleapis.com/v1/places/${placeId}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 'addressComponents'
      }
    });
    
    const data = await response.json();
    
    if (!data.addressComponents) {
      console.error('No address components found');
      return { street: '', city: '', state: '', zipCode: '', country: '' };
    }
    
    const components = data.addressComponents;
    
    const getComponent = (types: string[]): string => {
      const component = components.find((c: any) => 
        types.some(type => c.types.includes(type))
      );
      return component ? component.short_name : '';
    };
    
    const getLongComponent = (types: string[]): string => {
      const component = components.find((c: any) => 
        types.some(type => c.types.includes(type))
      );
      return component ? component.long_name : '';
    };
    
    const streetNumber = getComponent(['street_number']);
    const streetName = getLongComponent(['route']);
    const street = streetNumber && streetName ? `${streetNumber} ${streetName}` : (streetName || streetNumber);
    
    return {
      street: street || '',
      city: getLongComponent(['locality', 'sublocality']) || '',
      state: getComponent(['administrative_area_level_1']) || '',
      zipCode: getComponent(['postal_code']) || '',
      country: getComponent(['country']) || 'US'
    };
  } catch (error) {
    console.error('Google Places Details API error:', error);
    throw error;
  }
};

export default function AddressAutocomplete({
  label,
  value,
  onChangeText,
  onAddressSelected,
  placeholder,
  style,
  mode = 'outlined'
}: AddressAutocompleteProps) {
  const theme = useTheme();
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    suggestionsContainer: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      zIndex: 1000,
      maxHeight: 200,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    suggestionItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    loadingContainer: {
      padding: 16,
      alignItems: 'center',
    }
  });

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length >= 3) {
      searchTimeout.current = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await placesSearch(value);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Address search error:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [value]);

  const handleSuggestionPress = async (suggestion: AddressSuggestion) => {
    setShowSuggestions(false);
    onChangeText(suggestion.description);
    
    try {
      const addressComponents = await getPlaceDetails(suggestion.place_id);
      onAddressSelected(addressComponents);
    } catch (error) {
      console.error('Place details error:', error);
    }
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    if (text.length < 3) {
      setShowSuggestions(false);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={handleTextChange}
        onBlur={handleBlur}
        onFocus={() => value.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        mode={mode}
        right={loading ? <TextInput.Icon icon={() => <ActivityIndicator size={16} />} /> : undefined}
      />
      
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <Card style={styles.suggestionsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <List.Item
                    title={item.structured_formatting.main_text}
                    description={item.structured_formatting.secondary_text}
                    titleNumberOfLines={1}
                    descriptionNumberOfLines={1}
                  />
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </Card>
      )}
    </View>
  );
}
