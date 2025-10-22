import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import SearchBar from '../components/SearchBar';
import ProductItem from '../components/ProductItem';
import colors from '../theme/colors';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Guaraná', price: 5.5 },
  { id: '2', name: 'Fanta', price: 5.5 },
  { id: '3', name: 'Cerveja Skol', price: 5.5 },
  { id: '4', name: 'Cerveja Heineken', price: 5.5 },
  { id: '5', name: 'Cerveja Budweiser', price: 5.5 },
  { id: '6', name: 'Cerveja Brahma', price: 5.5 }
];

export default function ProductListScreen({ user, onNavigate }) {
  const [search, setSearch] = useState('');
  const [userData, setUserData] = useState(user || {});

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MOCK_PRODUCTS;
    return MOCK_PRODUCTS.filter(product => product.name.toLowerCase().includes(query));
  }, [search]);

  const handleBack = () => {
    onNavigate('Login');
  };

  const handleConfirm = () => {
    onNavigate('Login');
  };

  const getMesaInfo = () => {
    if (typeof user === 'object' && user.mesa) {
      return `Mesa: ${user.mesa} | ${user.tableCapacity} pessoas`;
    }
    return 'Mesa: --';
  };

  const getClientName = () => {
    if (typeof user === 'object' && user.user) {
      return user.user;
    }
    return user || 'Cliente';
  };

  const getClientInfo = () => {
    if (typeof user === 'object') {
      return `${user.email || ''} | ${user.phone || ''}`;
    }
    return '';
  };

  const handleSearch = () => {
    // Search is already applied via state, but this keeps button functional
  };

  const handleAdd = product => {
    // Placeholder for adding product to order
  };

  const renderItem = ({ item }) => (
    <ProductItem item={item} onAdd={handleAdd} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.icon}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getMesaInfo()}</Text>
          </View>
          <Text style={styles.clientName}>{getClientName()}</Text>
          <Text style={styles.clientInfo}>{getClientInfo()}</Text>
        </View>
        <TouchableOpacity onPress={handleConfirm}>
          <Text style={styles.icon}>{'✓'}</Text>
        </TouchableOpacity>
      </View>

      <SearchBar value={search} onChangeText={setSearch} onSubmit={handleSearch} />

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12
  },
  icon: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: '600'
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8
  },
  clientInfo: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4
  },
  listContent: {
    paddingTop: 16
  }
});
