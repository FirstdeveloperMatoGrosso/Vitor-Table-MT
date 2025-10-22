import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const initialTables = [
  {
    id: '1',
    mesa: 5,
    cliente: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    pessoas: 4,
    chegada: '14:30',
    status: 'aberta',
    produtos: [
      { nome: 'Cerveja Skol', quantidade: 3, preco: 15.0 },
      { nome: 'Refrigerante', quantidade: 2, preco: 8.0 }
    ],
    garcons: ['Carlos', 'Ana']
  },
  {
    id: '2',
    mesa: 12,
    cliente: 'Maria Santos',
    email: 'maria@email.com',
    telefone: '(11) 99876-5432',
    cpf: '987.654.321-00',
    pessoas: 6,
    chegada: '13:00',
    saida: '15:00',
    status: 'fechada',
    produtos: [
      { nome: 'Cerveja Heineken', quantidade: 5, preco: 18.0 },
      { nome: 'Chopp', quantidade: 4, preco: 25.0 }
    ],
    garcons: ['Pedro', 'Carlos', 'Ana']
  },
  {
    id: '3',
    mesa: 8,
    cliente: 'Pedro Costa',
    email: 'pedro@email.com',
    telefone: '(11) 91234-5678',
    cpf: '456.789.123-00',
    pessoas: 2,
    chegada: '15:30',
    status: 'aberta',
    produtos: [
      { nome: 'Refrigerante', quantidade: 1, preco: 8.0 },
      { nome: 'Cerveja Brahma', quantidade: 2, preco: 14.0 }
    ],
    garcons: ['Ana']
  },
  {
    id: '4',
    mesa: 15,
    cliente: 'Ana Oliveira',
    email: 'ana@email.com',
    telefone: '(11) 99631-2109',
    cpf: '789.123.456-00',
    pessoas: 8,
    chegada: '12:50',
    saida: '13:45',
    status: 'fechada',
    produtos: [
      { nome: 'Cerveja Brahma', quantidade: 8, preco: 14.0 },
      { nome: 'Refrigerante', quantidade: 4, preco: 8.0 }
    ],
    garcons: ['Carlos', 'Pedro']
  }
];

const STORAGE_KEY = 'cloe_tables_state_v1';

const TableContext = createContext();

export const useTableContext = () => {
  const ctx = useContext(TableContext);
  if (!ctx) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return ctx;
};

const loadFromStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Erro ao carregar dados locais das mesas:', error);
    return null;
  }
};

const persistToStorage = (tables) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
  } catch (error) {
    console.warn('Erro ao salvar dados locais das mesas:', error);
  }
};

export const TableProvider = ({ children }) => {
  const [tables, setTables] = useState(() => loadFromStorage() ?? initialTables);

  useEffect(() => {
    persistToStorage(tables);
  }, [tables]);

  const value = useMemo(
    () => ({
      tables,
      setTables,
      addProductsToTable: (tableId, products) => {
        setTables((prev) =>
          prev.map((table) => {
            if (table.id !== tableId) return table;

            const mergedProducts = [...table.produtos];
            products.forEach((prod) => {
              const existingIdx = mergedProducts.findIndex((item) => item.nome === prod.nome);
              if (existingIdx >= 0) {
                mergedProducts[existingIdx] = {
                  ...mergedProducts[existingIdx],
                  quantidade: mergedProducts[existingIdx].quantidade + prod.quantidade
                };
              } else {
                mergedProducts.push(prod);
              }
            });

            return {
              ...table,
              produtos: mergedProducts
            };
          })
        );
      }
    }),
    [tables]
  );

  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
};
