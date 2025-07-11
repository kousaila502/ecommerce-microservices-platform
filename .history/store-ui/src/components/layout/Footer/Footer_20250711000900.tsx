// src/components/layout/Footer/Footer.tsx (ENHANCED VERSION)
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Paper,
  Chip,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  ShoppingBag as ShopIcon,
  Security as SecurityIcon,
  LocalShipping as ShippingIcon,
  Refresh as ReturnIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { label: 'Electronics', href: '/search?category=electronics' },
        { label: 'Clothing', href: '/search?category=clothing' },
        { label: 'Shoes', href: '/search?category=shoes' },
        { label: 'Home & Garden', href: '/search?category=home' },
        { label: 'Sports', href: '/search?category=sports' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Shipping Info', href: '/shipping' },
        { label: 'Returns', href: '/returns' },
        { label: 'Order Tracking', href: '/orders' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About TechMart', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
        { label: 'Sustainability', href: '/sustainability' },
        { label: 'Investor Relations', href: '/investors' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Accessibility', href: '/accessibility' },
        { label: 'Site Map', href: '/sitemap' },
      ],
    },
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, href: 'https://facebook.com/techmart', label: 'Facebook' },
    { icon: <TwitterIcon />, href: 'https://twitter.com/techmart', label: 'Twitter' },
    { icon: <InstagramIcon />, href: 'https://instagram.com/techmart', label: 'Instagram' },
    { icon: <LinkedInIcon />, href: 'https://linkedin.com/company/techmart', label: 'LinkedIn' },
  ];

  const features = [
    { icon: <ShippingIcon />, text: 'Free Shipping' },
    { icon: <SecurityIcon />, text: 'Secure Payment' },
    { icon: <ReturnIcon />, text: '30-Day Returns' },
    { icon: <SupportIcon />, text: '24/7 Support' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {/* Features Bar */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.main',
          color: 'white',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  {feature.icon}
                  <Typography variant="body2" fontWeight="medium">
                    {feature.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Main Footer Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShopIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  TechMart
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your premier destination for quality electronics, fashion, and lifestyle products. 
                We're committed to providing exceptional customer service and unbeatable prices.
              </Typography>
              
              {/* Contact Info */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" color="primary" />
                  <Typography variant="body2">support@techmart.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" color="primary" />
                  <Typography variant="body2">1-800-TECHMART</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" color="primary" />
                  <Typography variant="body2">San Francisco, CA</Typography>
                </Box>
              </Box>
            </Box>

            {/* Social Links */}
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <Grid item xs={6} md={2} key={index}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    underline="hover"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.875rem',
                      '&:hover': {
                        color: 'primary.main',
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Newsletter Signup */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'primary.light',
            color: theme.palette.mode === 'dark' ? 'white' : 'primary.contrastText',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Stay Updated!
              </Typography>
              <Typography variant="body2">
                Subscribe to our newsletter for exclusive deals, new arrivals, and tech insights.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label="Coming Soon"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'inherit',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} TechMart. All rights reserved. Built with ❤️ for exceptional shopping experiences.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip label="GitOps Powered" size="small" color="primary" variant="outlined" />
            <Chip label="Microservices" size="small" color="secondary" variant="outlined" />
            <Chip label="React + TypeScript" size="small" color="primary" variant="outlined" />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;