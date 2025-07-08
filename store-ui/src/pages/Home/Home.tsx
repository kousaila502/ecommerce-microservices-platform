import data from '../../utils/assets'
import './Home.css';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CardActionArea from '@mui/material/CardActionArea';
import Deals from '../../components/Deals/Deals'
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to search results page with category as search query
    // Since we're using Elasticsearch, we search for the category name
    navigate(`/search?q=${encodeURIComponent(categoryName)}&category=${encodeURIComponent(categoryName)}`);
  };
 
  return (
    <div>
      <Box sx={{ flexGrow: 1, p: 2 }}>
        <Deals />
      </Box>
      <Grid container>
        <Grid item sx={{ pl: 2, pr: 2, width: '100%'}}>
          <Paper elevation={3} sx={{ pl: 2, pb: 2 }}>
            <Typography variant="h6" sx={{ p: 1, color: 'text.primary' }}>
              Shop by Category
            </Typography>
            <Grid container spacing={2}>
              {data['categories'].map((category, index) => (
                <Grid item key={index}>
                  <Card sx={{ width: 160, height: 200, cursor: 'pointer' }}>
                    <CardActionArea 
                      onClick={() => handleCategoryClick(category.name)}
                      sx={{ height: '100%' }}
                    >
                      <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Typography color="text.secondary" variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {category.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}> 
                          <img 
                            src={category.image} 
                            height="120" 
                            alt={category.name}
                            style={{ objectFit: 'contain' }}
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
    </div>
  );
}

export default Home;