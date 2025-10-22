import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Image, Dimensions } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

const AVAILABLE_PRODUCTS = [
  {
    id: '1',
    nome: 'Guaraná',
    preco: 5.50,
    estoque: 24,
    descricao: 'Refrigerante guaraná lata 350ml',
    imagem: 'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?auto=format&fit=crop&w=200&q=60'
  },
  {
    id: '2',
    nome: 'Fanta',
    preco: 5.50,
    estoque: 18,
    descricao: 'Fanta laranja lata 350ml',
    imagem: 'https://images.unsplash.com/photo-1524594154908-edd0e0cddc16?auto=format&fit=crop&w=200&q=60'
  },
  {
    id: '3',
    nome: 'Cerveja Skol',
    preco: 15.00,
    estoque: 40,
    descricao: 'Skol long neck 275ml',
    imagem: 'https://images.unsplash.com/photo-1509223180465-0c16baebb5a0?auto=format&fit=crop&w=200&q=60'
  },
  {
    id: '4',
    nome: 'Cerveja Heineken',
    preco: 18.00,
    estoque: 32,
    descricao: 'Heineken long neck 330ml',
    imagem: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=200&q=60'
  },
  {
    id: '5',
    nome: 'Cerveja Budweiser',
    preco: 16.00,
    estoque: 28,
    descricao: 'Budweiser long neck 330ml',
    imagem: 'https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=200&q=60'
  },
  {
    id: '6',
    nome: 'Cerveja Brahma',
    preco: 14.00,
    estoque: 35,
    descricao: 'Brahma Duplo Malte 350ml',
    imagem: 'https://images.unsplash.com/photo-1571907486588-9937bd132a95?auto=format&fit=crop&w=200&q=60'
  },
  {
    id: '7',
    nome: 'Chopp',
    preco: 25.00,
    estoque: 16,
    descricao: 'Chopp artesanal 500ml',
    imagem: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=200&q=60'
  },
  {
    id: '8',
    nome: 'Refrigerante',
    preco: 8.00,
    estoque: 20,
    descricao: 'Refrigerante sabores variados 1L',
    imagem: 'https://images.unsplash.com/photo-1581578731557-9303c7e95b9d?auto=format&fit=crop&w=200&q=60'
  }
];

export default function SellProductScreen({ table, onNavigate }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState('');

  const handleBack = () => {
    onNavigate('OpenTables');
  };

  const filteredProducts = AVAILABLE_PRODUCTS.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddProduct = (product) => {
    const existing = selectedProducts.find(p => p.id === product.id);
    if (existing) {
      setSelectedProducts(
        selectedProducts.map(p =>
          p.id === product.id ? { ...p, quantidade: p.quantidade + 1 } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantidade: 1 }]);
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleDecreaseQty = (productId) => {
    setSelectedProducts(
      selectedProducts
        .map(p =>
          p.id === productId ? { ...p, quantidade: p.quantidade - 1 } : p
        )
        .filter(p => p.quantidade > 0)
    );
  };

  const total = selectedProducts.reduce((sum, p) => sum + (p.preco * p.quantidade), 0);

  const handleConfirmSale = () => {
    if (selectedProducts.length === 0) {
      alert('Selecione pelo menos um produto');
      return;
    }
    alert(`Venda confirmada para Mesa ${table.mesa}\nTotal: R$ ${total.toFixed(2)}`);
    onNavigate('OpenTables');
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleAddProduct(item)}
    >
      <Image source={{ uri: item.imagem }} style={styles.productImage} />
      <Text style={styles.productName}>{item.nome}</Text>
      <Text style={styles.productDescription}>{item.descricao}</Text>
      <View style={styles.productMeta}>
        <Text style={styles.productPrice}>R$ {item.preco.toFixed(2)}</Text>
        <Text style={styles.productStock}>Estoque: {item.estoque}</Text>
      </View>
      <Text style={styles.productAdd}>Adicionar</Text>
    </TouchableOpacity>
  );

  const renderSelectedProduct = ({ item }) => (
    <View style={styles.selectedProductItem}>
      <View style={styles.selectedProductInfo}>
        <Text style={styles.selectedProductName}>{item.nome}</Text>
        <Text style={styles.selectedProductPrice}>R$ {(item.preco * item.quantidade).toFixed(2)}</Text>
      </View>
      <View style={styles.qtyControls}>
        <TouchableOpacity onPress={() => handleDecreaseQty(item.id)}>
          <Text style={styles.qtyButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantidade}</Text>
        <TouchableOpacity onPress={() => handleAddProduct(item)}>
          <Text style={styles.qtyButton}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => handleRemoveProduct(item.id)}>
        <Text style={styles.removeButton}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Vender - Mesa {table.mesa}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Pesquisar produto..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Produtos Disponíveis</Text>
          <FlatList
            data={filteredProducts}
            keyExtractor={item => item.id}
            renderItem={renderProduct}
            numColumns={4}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productGrid}
            scrollEnabled={false}
          />
        </View>

        {selectedProducts.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionTitle}>Produtos Selecionados</Text>
            <FlatList
              data={selectedProducts}
              keyExtractor={item => item.id}
              renderItem={renderSelectedProduct}
              scrollEnabled={false}
            />
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
            </View>
            <PrimaryButton
              title="Confirmar Venda"
              onPress={handleConfirmSale}
              style={styles.confirmButton}
            />
          </View>
        )}
      </View>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  backButton: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: '600'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'center'
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  productsSection: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12
  },
  productGrid: {
    gap: 12
  },
  productRow: {
    justifyContent: 'space-between'
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
    maxWidth: (width - 64) / 4
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 10
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4
  },
  productDescription: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 8
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary
  },
  productStock: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600'
  },
  productAdd: {
    marginTop: 'auto',
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 6
  },
  selectedSection: {
    marginBottom: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12
  },
  selectedProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  selectedProductInfo: {
    flex: 1
  },
  selectedProductName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text
  },
  selectedProductPrice: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 8
  },
  qtyButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '700'
  },
  qty: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    minWidth: 20,
    textAlign: 'center'
  },
  removeButton: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: '700'
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    marginBottom: 12
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary
  },
  confirmButton: {
    marginBottom: 16
  }
});
