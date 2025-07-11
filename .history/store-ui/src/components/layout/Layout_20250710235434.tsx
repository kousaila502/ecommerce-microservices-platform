// src/components/layout/Layout.tsx (WITH CART SIDEBAR)
import React from "react"
import Header from "./Header/Header"
import Footer from "./Footer/Footer"
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeContext from "./ThemeContext";
import GlobalContext from "./GlobalContext";
import CartSidebar from "../Cart/CartSidebar";
import { useCart } from "../../contexts/CartContext";

const Layout = (props: any) => {

    const [mode, setMode] = React.useState<'light' | 'dark'>('light');
    const { isCartSidebarOpen, closeCartSidebar, refreshCart } = useCart();

    const [data, setData] = React.useState({});
    const value = React.useMemo(
        () => ({ data, setData }),
        [data]
    );

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [],
    );

    const baseTheme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: mode === 'light' ? '#1976d2' : '#90caf9',
                        light: mode === 'light' ? '#42a5f5' : '#bbdefb',
                        dark: mode === 'light' ? '#1565c0' : '#64b5f6',
                    },
                    secondary: {
                        main: mode === 'light' ? '#dc004e' : '#f48fb1',
                        light: mode === 'light' ? '#ff5983' : '#f8bbd9',
                        dark: mode === 'light' ? '#9a0036' : '#f06292',
                    },
                    background: {
                        default: mode === 'light' ? '#fafafa' : '#121212',
                        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
                    },
                },
                breakpoints: {
                    values: {
                        xs: 0,
                        sm: 600,
                        md: 960,
                        lg: 1280,
                        xl: 1920,
                    },
                },
                spacing: 8,
                shape: {
                    borderRadius: 12,
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                scrollbarWidth: 'thin',
                                scrollbarColor: mode === 'light' ? '#d4d4d4 #f0f0f0' : '#6b6b6b #2b2b2b',
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: mode === 'light' ? '#f0f0f0' : '#2b2b2b',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: mode === 'light' ? '#d4d4d4' : '#6b6b6b',
                                    borderRadius: '4px',
                                },
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                textTransform: 'none',
                                fontWeight: 500,
                                padding: '8px 16px',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: mode === 'light' 
                                        ? '0 4px 12px rgba(0,0,0,0.15)' 
                                        : '0 4px 12px rgba(0,0,0,0.4)',
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 16,
                                transition: 'all 0.3s ease-in-out',
                                boxShadow: mode === 'light' 
                                    ? '0 2px 12px rgba(0,0,0,0.08)' 
                                    : '0 2px 12px rgba(0,0,0,0.3)',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: mode === 'light' 
                                        ? '0 8px 25px rgba(0,0,0,0.12)' 
                                        : '0 8px 25px rgba(0,0,0,0.4)',
                                },
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 8,
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                    },
                                },
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiChip: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                            },
                        },
                    },
                },
            }),
        [mode],
    );

    // Make the theme responsive for typography
    const theme = responsiveFontSizes(baseTheme);

    return (
        <ThemeContext.Provider value={colorMode}>
            <GlobalContext.Provider value={value}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    {/* Main container with sticky footer layout */}
                    <Box 
                        sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '100vh',
                            bgcolor: 'background.default',
                            position: 'relative',
                        }}
                    >
                        <Header />
                        
                        {/* Main content area that grows to fill space */}
                        <Box
                            component="main"
                            sx={{
                                flex: 1,
                                width: '100%',
                                bgcolor: 'background.default',
                                py: { xs: 1, sm: 2 },
                                px: { xs: 0, sm: 0 }, // Container will handle padding
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {/* Content wrapper with responsive container */}
                            <Container 
                                maxWidth="xl" 
                                sx={{ 
                                    flex: 1,
                                    px: { xs: 1, sm: 2, md: 3 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {props.children}
                            </Container>
                        </Box>
                        
                        {/* Footer will stick to bottom */}
                        <Footer />
                        
                        {/* Cart Sidebar */}
                        <CartSidebar 
                            open={isCartSidebarOpen} 
                            onClose={closeCartSidebar}
                            onCartUpdate={refreshCart}
                        />
                    </Box>
                </ThemeProvider>
            </GlobalContext.Provider>
        </ThemeContext.Provider>
    )
}

export default Layout