import React, { useEffect, useState } from "react";
import data from "../../utils/assets";
import "./Home.css";
import { useNavigate } from "react-router-dom";

// UI Components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";

// Custom Components
import Deals from "../../components/Deals/Deals";

// API
import { getAllProducts, Product } from "../../api/products";

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/search?q=${encodeURIComponent(categoryName)}&category=${encodeURIComponent(categoryName)}`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getAllProducts({ limit: 8 });
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Deals />
      </Box>

      {/* Category Section */}
      <Grid container>
        <Grid item sx={{ pl: 2, pr: 2, width: "100%" }}>
          <Paper elevation={3} sx={{ pl: 2, pb: 2 }}>
            <Typography variant="h6" sx={{ p: 1, color: "text.primary" }}>
              Shop by Category
            </Typography>
            <Grid container spacing={2}>
              {data["categories"].map((category, index) => (
                <Grid item key={index}>
                  <Card sx={{ width: 160, height: 200, cursor: "pointer" }}>
                    <CardActionArea onClick={() => handleCategoryClick(category.name)} sx={{ height: "100%" }}>
                      <CardContent
                        sx={{
                          textAlign: "center",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography color="text.secondary" variant="subtitle1" sx={{ fontWeight: "medium" }}>
                          {category.name}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                          <img
                            src={category.image}
                            height="120"
                            alt={category.name}
                            style={{ objectFit: "contain" }}
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Featured Products Section */}
      <Box sx={{ px: 2, py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Featured Products
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product._id}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/product/${product._id}`)}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={product.image}
                      alt={product.title}
                      sx={{ objectFit: "contain" }}
                    />
                    <CardContent>
                      <Typography variant="h6">{product.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.brand}
                      </Typography>
                      <Typography variant="subtitle1" color="primary">
                        {product.price} {product.currency}
                      </Typography>
                      <Typography variant="body2" color={product.stock > 0 ? "green" : "error"}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </div>
  );
}

export default Home;
