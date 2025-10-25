import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView, Dimensions, Platform } from 'react-native';
import SearchBar from '../components/SearchBar';
import ProductItem from '../components/ProductItem';
import colors from '../theme/colors';

const windowDimensions = Dimensions.get('window');
const floatingCartPosition = Platform.select({
  web: { position: 'fixed' },
  default: { position: 'absolute' }
});

const MOCK_PRODUCTS = [
  // Refrigerantes
  { id: '1', name: 'Guaraná', description: 'Refrigerante Guaraná Antarctica 350ml', price: 5.50, stock: 45, image: '🥤', category: 'Refrigerantes' },
  { id: '2', name: 'Fanta', description: 'Refrigerante Fanta Laranja 350ml', price: 5.50, stock: 32, image: '🥤', category: 'Refrigerantes' },
  { id: '3', name: 'Coca-Cola', description: 'Refrigerante Coca-Cola 350ml', price: 6.00, stock: 80, image: '🥤', category: 'Refrigerantes' },
  { id: '4', name: 'Sprite', description: 'Refrigerante Sprite Lima-Limão 350ml', price: 5.50, stock: 40, image: '🥤', category: 'Refrigerantes' },
  
  // Cervejas
  { id: '5', name: 'Cerveja Skol', description: 'Cerveja Skol Pilsen 350ml - Gelada', price: 5.50, stock: 120, image: '🍺', category: 'Cervejas' },
  { id: '6', name: 'Cerveja Heineken', description: 'Cerveja Heineken Premium 350ml - Importada', price: 8.50, stock: 58, image: '🍺', category: 'Cervejas' },
  { id: '7', name: 'Cerveja Budweiser', description: 'Cerveja Budweiser American Lager 350ml', price: 7.00, stock: 75, image: '🍺', category: 'Cervejas' },
  { id: '8', name: 'Cerveja Brahma', description: 'Cerveja Brahma Chopp 350ml - Gelada', price: 5.50, stock: 0, image: '🍺', category: 'Cervejas' },
  { id: '9', name: 'Cerveja Corona', description: 'Cerveja Corona Extra 355ml - Importada', price: 9.50, stock: 45, image: '🍺', category: 'Cervejas' },
  
  // Petiscos
  { id: '10', name: 'Batata Frita', description: 'Porção de batata frita crocante', price: 12.90, stock: 25, image: '🍟', category: 'Petiscos' },
  { id: '11', name: 'Pastel', description: 'Pastel de carne ou queijo', price: 3.50, stock: 30, image: '🥟', category: 'Petiscos' },
  { id: '12', name: 'Coxinha', description: 'Coxinha de frango com catupiry', price: 4.00, stock: 40, image: '🍗', category: 'Petiscos' },
  { id: '13', name: 'Amendoim', description: 'Porção de amendoim torrado', price: 5.00, stock: 50, image: '🥜', category: 'Petiscos' },
  
  // Sucos
  { id: '14', name: 'Suco de Laranja', description: 'Suco natural de laranja 500ml', price: 8.00, stock: 20, image: '🧋', category: 'Sucos' },
  { id: '15', name: 'Suco de Limão', description: 'Suco natural de limão 500ml', price: 7.50, stock: 18, image: '🧋', category: 'Sucos' },
  { id: '16', name: 'Suco de Maracujá', description: 'Suco natural de maracujá 500ml', price: 8.50, stock: 15, image: '🧋', category: 'Sucos' },
  
  // Água
  { id: '17', name: 'Água Mineral', description: 'Água mineral sem gás 500ml', price: 3.00, stock: 100, image: '💧', category: 'Água' },
  { id: '18', name: 'Água com Gás', description: 'Água mineral com gás 500ml', price: 3.50, stock: 80, image: '💧', category: 'Água' }
];

export default function ProductListScreen({ onNavigate, screenParams }) {
  const user = screenParams?.user || {};
  const [search, setSearch] = useState('');
  const [userData, setUserData] = useState(user);
  const [cart, setCart] = useState([]);
  const [isTableModalVisible, setIsTableModalVisible] = useState(false);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [isOrderConfirmModalVisible, setIsOrderConfirmModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [orderNumber, setOrderNumber] = useState(null);
  const [screenWidth, setScreenWidth] = useState(windowDimensions.width);
  const [screenHeight, setScreenHeight] = useState(windowDimensions.height);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const { isKioskMode = false, kioskFunctions = {} } = screenParams || {};

  const categories = ['Todos', ...new Set(MOCK_PRODUCTS.map(p => p.category))];

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    const query = search.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(product => product.name.toLowerCase().includes(query));
    }
    return filtered;
  }, [search, products, selectedCategory]);

  const isLargeScreen = screenWidth > 1024;
  const baseCols = isLargeScreen ? 10 : 4;
  const numCols = baseCols;
  const listMinHeight = Math.max(1200, screenHeight - 100);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
      setScreenHeight(window.height);
    });
    return () => subscription?.remove();
  }, []);

  const currentDate = new Date();
  const waiterName = 'João Silva'; // Mock - pode vir do contexto depois

  const handleBack = () => {
    onNavigate('Login', { isKioskMode, kioskFunctions });
  };

  const handleConfirm = () => {
    onNavigate('Login');
  };

  const getMesaInfo = () => {
    if (user && user.mesa) {
      return `Mesa ${user.mesa} - ${user.tableCapacity || 0} pessoas`;
    }
    return 'Mesa não definida';
  };

  const getClientName = () => {
    if (user && user.name) {
      return user.name;
    }
    return 'Cliente não identificado';
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
    // Não adicionar se estiver sem estoque
    if (product.stock === 0) {
      return;
    }
    
    // Diminuir estoque do produto
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    // Aumentar estoque do produto ao remover do carrinho
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, stock: p.stock + 1 } : p
      )
    );
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      return prevCart.filter(item => item.id !== productId);
    });
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleConfirmOrder = () => {
    // Gerar número do pedido
    const newOrderNumber = Math.floor(Math.random() * 9000) + 1000;
    setOrderNumber(newOrderNumber);
    setIsCartModalVisible(false);
    setIsOrderConfirmModalVisible(true);
  };

  const handleAddMoreProducts = () => {
    setIsOrderConfirmModalVisible(false);
  };

  const handleCloseOrder = () => {
    setIsOrderConfirmModalVisible(false);
    setCart([]);
    onNavigate('Home', { isKioskMode, kioskFunctions });
  };

  const dynamicStyles = {
    scrollView: {
      height: screenHeight - 300,
      backgroundColor: '#FFFFFF'
    },
    scrollContent: {
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 150,
      backgroundColor: '#FFFFFF',
      minHeight: screenHeight * 1.5
    }
  };

  return (
    <View style={styles.container}>
      {/* Header ocupa toda a largura da tela */}
      <View style={styles.fullWidthHeader}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.icon}>{'<'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerContent} onPress={() => setIsTableModalVisible(true)}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getMesaInfo()}</Text>
          </View>
          <Text style={styles.clientName}>{getClientName()}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleConfirm}>
          <Text style={styles.icon}>{'✓'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.centeredBlock}>
          <SearchBar value={search} onChangeText={setSearch} onSubmit={handleSearch} />
        </View>

        {/* Categorias */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={[styles.categoriesContainer, styles.centeredBlock]}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.listContainer, styles.centeredBlock]}>
          <ScrollView 
            style={dynamicStyles.scrollView}
            contentContainerStyle={dynamicStyles.scrollContent}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
          >
            <View style={styles.productsGrid}>
              {Array.from({ length: Math.ceil(filteredProducts.length / numCols) }, (_, rowIndex) => (
                <View key={rowIndex} style={styles.productRow}>
                  {Array.from({ length: numCols }, (_, colIndex) => {
                    const itemIndex = rowIndex * numCols + colIndex;
                    const item = filteredProducts[itemIndex];
                    return (
                      <View key={colIndex} style={styles.productWrapper}>
                        {item && <ProductItem item={item} onAdd={handleAdd} isGridMode={true} />}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Carrinho Flutuante */}
      {cart.length > 0 && (
        <View style={styles.floatingCart}>
          <TouchableOpacity 
            style={styles.floatingCartButton} 
            onPress={() => setIsCartModalVisible(true)}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
            </View>
            <Text style={styles.floatingCartIcon}>🛒</Text>
            <Text style={styles.floatingCartText}>R$ {getTotalPrice().toFixed(2)}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de Detalhes da Mesa */}
      <Modal
        visible={isTableModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsTableModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Detalhes da Mesa</Text>
            
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mesa:</Text>
                <Text style={styles.detailValue}>{user?.mesa || '--'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Capacidade:</Text>
                <Text style={styles.detailValue}>{user?.tableCapacity} pessoas</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cliente:</Text>
                <Text style={styles.detailValue}>{user?.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{user?.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Telefone:</Text>
                <Text style={styles.detailValue}>{user?.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>CPF:</Text>
                <Text style={styles.detailValue}>{user?.cpf}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Data:</Text>
                <Text style={styles.detailValue}>{currentDate.toLocaleDateString('pt-BR')}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hora:</Text>
                <Text style={styles.detailValue}>{currentDate.toLocaleTimeString('pt-BR')}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Garçom:</Text>
                <Text style={styles.detailValue}>{waiterName}</Text>
              </View>
            </View>

            <Pressable style={styles.modalButton} onPress={() => setIsTableModalVisible(false)}>
              <Text style={styles.modalButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal do Carrinho */}
      <Modal
        visible={isCartModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCartModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cartModalContainer}>
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Carrinho</Text>
              <TouchableOpacity onPress={() => setIsCartModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.cartContent}>
              {cart.map(item => (
                <View key={item.id} style={styles.cartItem}>
                  <View style={styles.cartItemInfo}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>R$ {item.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.cartItemActions}>
                    <TouchableOpacity style={styles.cartButton} onPress={() => handleRemoveFromCart(item.id)}>
                      <Text style={styles.cartButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.cartButton} onPress={() => handleAdd(item)}>
                      <Text style={styles.cartButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cartItemTotal}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.cartFooter}>
              <View style={styles.cartTotalRow}>
                <Text style={styles.cartTotalLabel}>Total:</Text>
                <Text style={styles.cartTotalValue}>R$ {getTotalPrice().toFixed(2)}</Text>
              </View>
              <Pressable style={styles.confirmButton} onPress={handleConfirmOrder}>
                <Text style={styles.confirmButtonText}>Confirmar Pedido</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Pedido */}
      <Modal
        visible={isOrderConfirmModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseOrder}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.orderConfirmContainer}>
            <View style={styles.orderConfirmHeader}>
              <Text style={styles.orderConfirmIcon}>✓</Text>
              <Text style={styles.orderConfirmTitle}>Pedido Confirmado!</Text>
              <Text style={styles.orderConfirmSubtitle}>Seu pedido foi adicionado à mesa</Text>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.orderDetailRow}>
                <Text style={styles.orderDetailLabel}>Pedido Nº:</Text>
                <Text style={styles.orderDetailValue}>#{orderNumber}</Text>
              </View>
              <View style={styles.orderDetailRow}>
                <Text style={styles.orderDetailLabel}>Mesa:</Text>
                <Text style={styles.orderDetailValue}>{user?.mesa || 'N/A'}</Text>
              </View>
              <View style={styles.orderDetailRow}>
                <Text style={styles.orderDetailLabel}>Cliente:</Text>
                <Text style={styles.orderDetailValue}>{user?.name || 'N/A'}</Text>
              </View>
              <View style={styles.orderDetailRow}>
                <Text style={styles.orderDetailLabel}>Garçom:</Text>
                <Text style={styles.orderDetailValue}>{waiterName}</Text>
              </View>
              <View style={styles.orderDetailRow}>
                <Text style={styles.orderDetailLabel}>Hora:</Text>
                <Text style={styles.orderDetailValue}>{currentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <View style={styles.orderDetailRow}>
                <Text style={styles.orderDetailLabel}>Itens:</Text>
                <Text style={styles.orderDetailValue}>{getTotalItems()}</Text>
              </View>
              <View style={styles.orderDetailRow}>
                <Text style={styles.orderDetailLabel}>Total:</Text>
                <Text style={styles.orderDetailValueHighlight}>R$ {getTotalPrice().toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.orderProductsList}>
              <Text style={styles.orderProductsTitle}>Produtos do Pedido:</Text>
              {cart.map(item => (
                <View key={item.id} style={styles.orderProductItem}>
                  <Text style={styles.orderProductName}>{item.quantity}x {item.name}</Text>
                  <Text style={styles.orderProductPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.orderActions}>
              <Pressable style={[styles.orderButton, styles.orderButtonSecondary]} onPress={handleCloseOrder}>
                <Text style={styles.orderButtonTextSecondary}>Fechar</Text>
              </Pressable>
              <Pressable style={[styles.orderButton, styles.orderButtonPrimary]} onPress={handleAddMoreProducts}>
                <Text style={styles.orderButtonTextPrimary}>Adicionar Mais</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  fullWidthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    width: '100%'
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center'
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
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 8
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  categoriesContainer: {
    maxHeight: 60,
    marginBottom: 8,
    alignSelf: 'center',
    width: '100%'
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    minWidth: '100%'
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 8
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted
  },
  categoryTextActive: {
    color: '#FFFFFF'
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center'
  },
  viewModeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(246, 134, 71, 0.1)'
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted
  },
  viewModeTextActive: {
    color: colors.primary
  },
  listContainer: {
    flex: 1,
    paddingBottom: 80
  },
  productsGrid: {
    flexDirection: 'column'
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  productWrapper: {
    flex: 1,
    marginHorizontal: 4
  },
  floatingCart: {
    ...floatingCartPosition,
    bottom: 30,
    right: 30,
    zIndex: 999999
  },
  floatingCartButton: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 8
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  floatingCartIcon: {
    fontSize: 24
  },
  floatingCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center'
  },
  detailsContent: {
    marginBottom: 20
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  detailLabel: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '600'
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600'
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center'
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  cartModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%',
    overflow: 'hidden'
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text
  },
  closeButton: {
    fontSize: 24,
    color: colors.muted,
    fontWeight: '600'
  },
  cartContent: {
    padding: 20,
    maxHeight: 400
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  cartItemInfo: {
    flex: 1
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  cartItemPrice: {
    fontSize: 13,
    color: colors.muted
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 12
  },
  cartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  },
  cartItemQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center'
  },
  cartItemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    minWidth: 70,
    textAlign: 'right'
  },
  cartFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  cartTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  cartTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center'
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  orderConfirmContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500
  },
  orderConfirmHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  orderConfirmIcon: {
    fontSize: 64,
    color: '#22C55E',
    marginBottom: 12
  },
  orderConfirmTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8
  },
  orderConfirmSubtitle: {
    fontSize: 14,
    color: colors.muted
  },
  orderDetails: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8
  },
  orderDetailLabel: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: '600'
  },
  orderDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600'
  },
  orderDetailValueHighlight: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700'
  },
  orderProductsList: {
    marginBottom: 20
  },
  orderProductsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12
  },
  orderProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  orderProductName: {
    fontSize: 14,
    color: colors.text,
    flex: 1
  },
  orderProductPrice: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600'
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12
  },
  orderButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  orderButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.border
  },
  orderButtonPrimary: {
    backgroundColor: colors.primary
  },
  orderButtonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text
  },
  orderButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});
