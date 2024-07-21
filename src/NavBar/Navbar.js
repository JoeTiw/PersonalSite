import React, { useState } from 'react';
import { AppBar, IconButton, Toolbar, Typography, Button, createTheme, ThemeProvider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { CssBaseline } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function NavBar() {
    const [darkMode, setDarkMode] = useState(true);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    const handleThemeToggle = () =>{
        setDarkMode(!darkMode);
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
        <AppBar position="static" color='inherit'>
            <Toolbar>
                <IconButton size="large" edge="start" color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <Typography
                    variant="h6"
                    noWrap
                    component="a"
                    href="#"
                    sx={{
                        mr: 2,
                        display: { xs: 'none', md: 'flex' },
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                    }}
                >
                    BHUPIN
                </Typography>
                <div style={{ flexGrow: 1 }} />
                <Button color="inherit" sx={{ fontWeight: 'bold' }} href="/">Home</Button>
                <Button color="inherit" sx={{ fontWeight: 'bold' }} href="/projects">Projects</Button>
                <Button color="inherit" sx={{ fontWeight: 'bold' }} href="/about">About</Button>
                <Button color="inherit" sx={{ fontWeight: 'bold' }} href="/contact">Contact</Button>
                <IconButton
          edge="end"
          color="inherit"
          onClick={handleThemeToggle}
          aria-label="toggle dark mode"
        >
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
            </Toolbar>
        </AppBar>
        </ThemeProvider>
    );
}
export default NavBar
