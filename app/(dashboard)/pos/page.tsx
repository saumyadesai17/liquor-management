'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface InventoryItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  brand: string;
  size: string;
  category_id: number;
}

interface CartItem extends InventoryItem {
  cartQuantity: number;
  subtotal: number;
}

export default function POS() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  // Filter inventory based on search
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.brand.toLowerCase().includes(search.toLowerCase())
  );
  
  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
  
  // Load inventory on component mount
  useEffect(() => {
    async function loadInventory() {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .select('*')
          .gt('quantity', 0);
          
        if (error) throw error;
        setInventory(data || []);
      } catch (error) {
        console.error('Error loading inventory:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadInventory();
  }, []);
  
  // Add item to cart
  const addToCart = (item: InventoryItem) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Update quantity if there's enough in stock
        if (existingItem.cartQuantity < existingItem.quantity) {
          return prevCart.map(cartItem => 
            cartItem.id === item.id 
              ? { 
                  ...cartItem, 
                  cartQuantity: cartItem.cartQuantity + 1,
                  subtotal: (cartItem.cartQuantity + 1) * cartItem.price
                } 
              : cartItem
          );
        }
        return prevCart;
      } else {
        // Add new item to cart
        return [...prevCart, {
          ...item,
          cartQuantity: 1,
          subtotal: item.price
        }];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };
  
  // Update cart item quantity
  const updateCartQuantity = (itemId: number, newQuantity: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === itemId) {
        // Ensure quantity doesn't exceed inventory
        const validQuantity = Math.min(newQuantity, item.quantity);
        return {
          ...item,
          cartQuantity: validQuantity,
          subtotal: validQuantity * item.price
        };
      }
      return item;
    }));
  };
  
  // Process order
  const processOrder = async () => {
    if (cart.length === 0) return;
    
    setProcessingOrder(true);
    
    try {
      // 1. Create new order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          total_amount: cartTotal,
          payment_method: paymentMethod,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select('id')
        .single();
      
      if (orderError) throw orderError;
      
      // 2. Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        inventory_id: item.id,
        quantity: item.cartQuantity,
        price: item.price,
        subtotal: item.subtotal
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
      
      // 3. Update inventory quantities
      for (const item of cart) {
        const { error: updateError } = await supabase
          .from('inventory')
          .update({ 
            quantity: item.quantity - item.cartQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
          
        if (updateError) throw updateError;
      }
      
      // Clear cart after successful order
      setCart([]);
      setCustomerName('');
      setShowMobileCart(false);
      
      // Refresh inventory
      const { data: refreshedInventory } = await supabase
        .from('inventory')
        .select('*')
        .gt('quantity', 0);
        
      setInventory(refreshedInventory || []);
      
      alert('Order processed successfully!');
      
    } catch (error) {
      console.error('Error processing order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };
  
  // Lock body scroll when mobile cart is shown
  useEffect(() => {
    if (showMobileCart) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showMobileCart]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-muted mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Mobile Cart Toggle Button */}
      <div className="fixed bottom-4 right-4 lg:hidden z-40">
        <button
          onClick={() => setShowMobileCart(true)}
          className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg flex items-center justify-center relative"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Inventory Section */}
        <div className="w-full lg:w-2/3 bg-card rounded-lg shadow-md p-4 border border-border">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full p-2 bg-input text-foreground border border-border rounded focus:ring-1 focus:ring-ring focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInventory.length > 0 ? (
              filteredInventory.map(item => (
                <div 
                  key={item.id} 
                  className="border border-border rounded p-3 cursor-pointer bg-secondary hover:bg-muted transition-colors duration-200"
                  onClick={() => addToCart(item)}
                >
                  <h3 className="font-medium text-foreground">{item.name}</h3>
                  <div className="text-sm text-muted-foreground">{item.brand} - {item.size}</div>
                  <div className="flex justify-between mt-2">
                    <span className="font-bold text-accent">₹{item.price.toFixed(2)}</span>
                    <span className={`text-sm ${item.quantity < 5 ? 'text-red-500' : 'text-green-500'}`}>
                      {item.quantity} in stock
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-4 text-muted-foreground">
                No items found. Try a different search term.
              </div>
            )}
          </div>
        </div>
        
        {/* Desktop Cart Section */}
        <div className="hidden lg:block w-1/3 bg-card rounded-lg shadow-md border border-border">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Current Order</h2>
          </div>
          
          <div className="p-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
            {cart.length > 0 ? (
              cart.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 pb-2 border-b border-border">
                  <div className="mb-2 sm:mb-0">
                    <div className="font-medium text-foreground">{item.name}</div>
                    <div className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</div>
                  </div>
                  
                  <div className="flex items-center">
                    <button 
                      className="bg-secondary text-secondary-foreground px-2 rounded-l hover:bg-muted transition-colors"
                      onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1 || 1)}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-t border-b border-border bg-input text-foreground">
                      {item.cartQuantity}
                    </span>
                    <button 
                      className="bg-secondary text-secondary-foreground px-2 rounded-r hover:bg-muted transition-colors"
                      onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="ml-3 text-red-500 hover:text-red-400 transition-colors"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Cart is empty
              </div>
            )}
          </div>
          
          {cart.length > 0 && (
            <div className="p-4 border-t border-border">
              <div className="flex justify-between text-lg font-bold mb-4 text-foreground">
                <span>Total:</span>
                <span className="text-accent">₹{cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm mb-1 text-muted-foreground">Customer Name (Optional)</label>
                <input
                  type="text"
                  className="w-full p-2 bg-input text-foreground border border-border rounded focus:ring-1 focus:ring-ring focus:outline-none"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm mb-1 text-muted-foreground">Payment Method</label>
                <select
                  className="w-full p-2 bg-input text-foreground border border-border rounded focus:ring-1 focus:ring-ring focus:outline-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>
              </div>
              
              <button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground p-2 rounded font-medium transition-colors duration-200"
                onClick={processOrder}
                disabled={processingOrder}
              >
                {processingOrder ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile Cart Slide-in Panel */}
        {showMobileCart && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setShowMobileCart(false)}
            />
            <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-card shadow-xl z-50 flex flex-col lg:hidden transform transition-transform duration-300 ease-in-out">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">Current Order</h2>
                <button 
                  onClick={() => setShowMobileCart(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length > 0 ? (
                  cart.map(item => (
                    <div key={item.id} className="mb-4 pb-4 border-b border-border">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-foreground">{item.name}</div>
                        <button 
                          className="text-red-500 hover:text-red-400 transition-colors"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">₹{item.price.toFixed(2)} each</div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <button 
                            className="bg-secondary text-secondary-foreground h-8 w-8 rounded-l flex items-center justify-center hover:bg-muted transition-colors"
                            onClick={() => updateCartQuantity(item.id, item.cartQuantity - 1 || 1)}
                          >
                            -
                          </button>
                          <span className="h-8 px-3 flex items-center border-t border-b border-border bg-input text-foreground">
                            {item.cartQuantity}
                          </span>
                          <button 
                            className="bg-secondary text-secondary-foreground h-8 w-8 rounded-r flex items-center justify-center hover:bg-muted transition-colors"
                            onClick={() => updateCartQuantity(item.id, item.cartQuantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="font-medium text-accent">
                          ₹{item.subtotal.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <button 
                      onClick={() => setShowMobileCart(false)}
                      className="mt-4 px-4 py-2 bg-secondary text-foreground rounded-md hover:bg-muted transition-colors"
                    >
                      Add Items
                    </button>
                  </div>
                )}
              </div>
              
              {cart.length > 0 && (
                <div className="p-4 border-t border-border">
                  <div className="flex justify-between text-lg font-bold mb-4 text-foreground">
                    <span>Total:</span>
                    <span className="text-accent">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm mb-1 text-muted-foreground">Customer Name (Optional)</label>
                    <input
                      type="text"
                      className="w-full p-2 bg-input text-foreground border border-border rounded focus:ring-1 focus:ring-ring focus:outline-none"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm mb-1 text-muted-foreground">Payment Method</label>
                    <select
                      className="w-full p-2 bg-input text-foreground border border-border rounded focus:ring-1 focus:ring-ring focus:outline-none"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                    </select>
                  </div>
                  
                  <button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-md font-medium transition-colors duration-200"
                    onClick={processOrder}
                    disabled={processingOrder}
                  >
                    {processingOrder ? 'Processing...' : 'Complete Sale'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}