import React, { useState, useEffect } from 'react';
import { getCart, Cart as CartType, CartItem } from "../../api/cart";
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Typography, Alert, CircularProgress, Divider } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import PaidIcon from '@mui/icons-material/Paid';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import { useNavigate } from "react-router-dom";

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<CartType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    
    // Individual quantity states for each item
    const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});

    const updateItemQuantity = (itemIndex: number, newQuantity: number) => {
        if (newQuantity > 0) {
            setItemQuantities(prev => ({
                ...prev,
                [itemIndex]: newQuantity
            }));
        }
    };

    const handleQuantityChange = (itemIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (value > 0) {
            updateItemQuantity(itemIndex, value);
        }
    };

    const handleIncrement = (itemIndex: number) => {
        const currentQuantity = itemQuantities[itemIndex] || 1;
        updateItemQuantity(itemIndex, currentQuantity + 1);
    };

    const handleDecrement = (itemIndex: number) => {
        const currentQuantity = itemQuantities[itemIndex] || 1;
        if (currentQuantity > 1) {
            updateItemQuantity(itemIndex, currentQuantity - 1);
        }
    };

    const handleRemoveItem = (itemIndex: number) => {
        // TODO: Implement remove item API call
        console.log('Remove item at index:', itemIndex);
    };

    const calculateTotal = (): number => {
        if (!cart?.items) return 0;
        
        return cart.items.reduce((total, item, index) => {
            const quantity = itemQuantities[index] || item.quantity;
            return total + (item.price * quantity);
        }, 0);
    };

    const handleCheckout = async () => {
        try {
            const orderResponse = await createOrder({
            userId: user.id,
            items: cart.items,
            total: calculateTotal(),
            currency: cart.items[0]?.currency || 'USD',
            });

            if (orderResponse) {
            // Optionally clear the cart
            await clearCart(user.id);  // implement this in `api/cart.tsx`
            navigate(`/orders/${orderResponse.orderId}`);
            } else {
            alert('Order failed. Try again.');
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Checkout failed');
        }
        };


    // Fetch cart on component mount
    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true);
                const cartData = await getCart();
                if (cartData) {
                    setCart(cartData);
                    // Initialize quantity states
                    const quantities: { [key: string]: number } = {};
                    cartData.items?.forEach((item, index) => {
                        quantities[index] = item.quantity;
                    });
                    setItemQuantities(quantities);
                } else {
                    setError('Failed to load cart');
                }
            } catch (err) {
                setError('Error loading cart');
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <Box sx={{ p: 2 }}>
                <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        Your cart is empty
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={() => navigate('/')}
                        sx={{ mt: 2 }}
                    >
                        Continue Shopping
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h5" gutterBottom>
                    Shopping Cart
                </Typography>
                
                {cart.items.map((item: CartItem, index: number) => (
                    <Box key={index}>
                        <Grid container spacing={2} alignItems="center" sx={{ py: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6">{item.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    SKU: {item.sku}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={6} sm={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton 
                                        color="primary" 
                                        aria-label="decrement" 
                                        onClick={() => handleDecrement(index)}
                                        size="small"
                                        disabled={(itemQuantities[index] || item.quantity) <= 1}
                                    >
                                        <RemoveCircleIcon />
                                    </IconButton>
                                    <TextField
                                        sx={{ width: '80px' }}
                                        size="small"
                                        type="number"
                                        value={itemQuantities[index] || item.quantity}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                            handleQuantityChange(index, e)
                                        }
                                        inputProps={{ min: 1 }}
                                    />
                                    <IconButton 
                                        color="primary" 
                                        aria-label="increment" 
                                        onClick={() => handleIncrement(index)}
                                        size="small"
                                    >
                                        <AddCircleIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={4} sm={2}>
                                <Typography variant="h6">
                                    {item.currency} {item.price}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total: {item.currency} {(item.price * (itemQuantities[index] || item.quantity)).toFixed(2)}
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={2} sm={1}>
                                <IconButton 
                                    color="error" 
                                    aria-label="remove item"
                                    onClick={() => handleRemoveItem(index)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                        {index < cart.items.length - 1 && <Divider />}
                    </Box>
                ))}
                
                <Box sx={{ mt: 3 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h6">
                                Total: $ {calculateTotal().toFixed(2)}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => navigate('/')}
                                >
                                    Continue Shopping
                                </Button>
                                <Button 
                                    variant="contained" 
                                    startIcon={<PaidIcon />}
                                    onClick={handleCheckout}
                                >
                                    Checkout
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Box>
    );
};

export default Cart;