// src/components/layout/Layout.tsx (ENHANCED WITH BETTER COLORS & ANIMATIONS)
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
                        main: mode === 'light' ? '#2563eb' : '#3b82f6',
                        light: mode === 'light' ? '#60a5fa' : '#93c5fd',
                        dark: mode === 'light' ? '#1d4ed8' : '#1e40af',
                        contrastText: '#ffffff',
                    },
                    secondary: {
                        main: mode === 'light' ? '#7c3aed' : '#a855f7',
                        light: mode === 'light' ? '#a78bfa' : '#c084fc',
                        dark: mode === 'light' ? '#5b21b6' : '#7c2d12',
                        contrastText: '#ffffff',
                    },
                    error: {
                        main: mode === 'light' ? '#dc2626' : '#ef4444',
                        light: mode === 'light' ? '#f87171' : '#fca5a5',
                        dark: mode === 'light' ? '#b91c1c' : '#dc2626',
                    },
                    warning: {
                        main: mode === 'light' ? '#d97706' : '#f59e0b',
                        light: mode === 'light' ? '#fbbf24' : '#fcd34d',
                        dark: mode === 'light' ? '#92400e' : '#d97706',
                    },
                    info: {
                        main: mode === 'light' ? '#0891b2' : '#06b6d4',
                        light: mode === 'light' ? '#22d3ee' : '#67e8f9',
                        dark: mode === 'light' ? '#0e7490' : '#0891b2',
                    },
                    success: {
                        main: mode === 'light' ? '#059669' : '#10b981',
                        light: mode === 'light' ? '#34d399' : '#6ee7b7',
                        dark: mode === 'light' ? '#047857' : '#059669',
                    },
                    background: {
                        default: mode === 'light' ? '#f8fafc' : '#0f172a',
                        paper: mode === 'light' ? '#ffffff' : '#1e293b',
                    },
                    text: {
                        primary: mode === 'light' ? '#1e293b' : '#f1f5f9',
                        secondary: mode === 'light' ? '#64748b' : '#94a3b8',
                    },
                    divider: mode === 'light' ? '#e2e8f0' : '#334155',
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
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: {
                        fontWeight: 700,
                        letterSpacing: '-0.025em',
                    },
                    h2: {
                        fontWeight: 700,
                        letterSpacing: '-0.025em',
                    },
                    h3: {
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                    },
                    h4: {
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                    },
                    h5: {
                        fontWeight: 600,
                    },
                    h6: {
                        fontWeight: 600,
                    },
                    button: {
                        fontWeight: 500,
                        textTransform: 'none',
                    },
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                scrollbarWidth: 'thin',
                                scrollbarColor: mode === 'light' ? '#cbd5e1 #f1f5f9' : '#475569 #1e293b',
                                '&::-webkit-scrollbar': {
                                    width: '8px',
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: mode === 'light' ? '#f1f5f9' : '#1e293b',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: mode === 'light' ? '#cbd5e1' : '#475569',
                                    borderRadius: '4px',
                                    '&:hover': {
                                        background: mode === 'light' ? '#94a3b8' : '#64748b',
                                    },
                                },
                            },
                        },
                    },
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 10,
                                textTransform: 'none',
                                fontWeight: 500,
                                padding: '10px 20px',
                                boxShadow: 'none',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: mode === 'light' 
                                        ? '0 10px 25px rgba(37, 99, 235, 0.15)' 
                                        : '0 10px 25px rgba(59, 130, 246, 0.25)',
                                },
                                '&:active': {
                                    transform: 'translateY(0)',
                                },
                            },
                            contained: {
                                background: mode === 'light' 
                                    ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                                    : 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                                '&:hover': {
                                    background: mode === 'light'
                                        ? 'linear-gradient(135deg, #1d4ed8 0%, #5b21b6 100%)'
                                        : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 16,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
                                boxShadow: mode === 'light' 
                                    ? '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' 
                                    : '0 4px 6px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.4)',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: mode === 'light' 
                                        ? '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)' 
                                        : '0 20px 25px rgba(0,0,0,0.4), 0 10px 10px rgba(0,0,0,0.2)',
                                },
                            },
                        },
                    },
                    MuiTextField: {
                        styleOverrides: {
                            root: {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 10,
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                    },
                                    '&.Mui-focused': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: mode === 'light'
                                            ? '0 0 0 3px rgba(37, 99, 235, 0.1)'
                                            : '0 0 0 3px rgba(59, 130, 246, 0.2)',
                                    },
                                },
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                                borderRadius: 12,
                            },
                        },
                    },
                    MuiChip: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                fontWeight: 500,
                            },
                        },
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                background: mode === 'light'
                                    ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
                                    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                boxShadow: mode === 'light'
                                    ? '0 4px 6px rgba(37, 99, 235, 0.1)'
                                    : '0 4px 6px rgba(0, 0, 0, 0.3)',
                            },
                        },
                    },
                    MuiIconButton: {
                        styleOverrides: {
                            root: {
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                            },
                        },
                    },
                    MuiListItemButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                margin: '2px 8px',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                    transform: 'translateX(4px)',
                                },
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