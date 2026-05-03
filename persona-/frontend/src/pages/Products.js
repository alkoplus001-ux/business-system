import React, { useEffect, useState } from 'react';
import ProductListTable from '../components/products/ProductListTable';
import api from '../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await api.get('/products');
      setProducts(res.data.data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="container py-4">
      <ProductListTable products={products} loading={loading} title="All Products" />
    </div>
  );
};

export default Products;
