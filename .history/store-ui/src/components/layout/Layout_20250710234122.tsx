// src/components/layout/Layout.tsx (UPDATED VERSION)
import React from "react"
import Header from "./Header/Header"
import Footer from "./Footer/Footer"
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ThemeContext from "./ThemeContext";
import GlobalContext from "./GlobalContext";

const Layout = (props: any) => {

    const [mode, setMode] = React.useState<'light' | 'dark'>('light');

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

    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: mode === 'light' ? '#1976d2' : '#90caf9',
                    },
                    secondary: {
                        main: mode === 'light' ? '#dc004e' : '#f48fb1',
                    },
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                textTransform: 'none',
                                fontWeight: 500,
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                boxShadow: mode === 'light' 
                                    ? '0 2px 8px rgba(0,0,0,0.1)' 
                                    : '0 2px 8px rgba(0,0,0,0.3)',
                            },
                        },
                    },
                },
            }),
        [mode],
    );

    return (
        <ThemeContext.Provider value={colorMode}>
            <GlobalContext.Provider value={value}>
                <ThemeProvider theme={theme}>
                    {/* Main container with sticky footer layout */}
                    <Box 
                        sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '100vh',
                            bgcolor: 'background.default',
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
                                pb: 2, // Add some padding at bottom
                            }}
                        >
                            {props.children}
                        </Box>
                        
                        {/* Footer will stick to bottom */}
                        <Footer />
                    </Box>
                </ThemeProvider>
            </GlobalContext.Provider>
        </ThemeContext.Provider>
    )
}

export default Layout