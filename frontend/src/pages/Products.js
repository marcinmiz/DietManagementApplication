import React, {useEffect} from 'react'
import CategoryIcon from '@material-ui/icons/Category';
import { MenuItem, Grid, Container, makeStyles, Tooltip} from '@material-ui/core';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import red_apple from "../images/red_apple.jpg"
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import FilledInput from '@material-ui/core/FilledInput';
import banana from "../images/banana.jpg"
import orange from "../images/orange.jpg"
import { useHistory } from "react-router-dom";

const useStyles = makeStyles( {
    formControl: {
        minWidth:110,
    },
});

export default function Products () {
    let history = useHistory();

    const classes = useStyles();

    const [state, setState] = React.useState({
        search: '',
        category: '',
        products_group: 0,//0: all, 1: new, 2: favourite
        products:[{product_id: 1, product_name: "Red apple", product_image: red_apple, product_category: "Fruit", product_author: "Daniel Fog", product_favourite: false},
            {product_id: 2, product_name: "Banana", product_image: banana, product_category: "Fruit", product_author: "Sara Bedrock", product_favourite: false},
            {product_id: 3, product_name: "Orange", product_image: orange, product_category: "Fruit", product_author: "Paul Weasley", product_favourite: false}],
    });

    useEffect(
        () => {
            // setState({
            //     ...state,
            //     products: [{product_id: 4, product_name: "Yoghurt", product_image: red_apple, product_category: "Dairy", product_author: "Paul Weasley", product_favourite: true}],
            // });
        }, [state.products_group]
    );

    const handleChange = (event) => {
        setState({
            ...state,
            [event.target.name]: event.target.value,
        });

    };

    const handleTab = (event, newValue) => {
        setState({
            ...state,
            products_group: newValue,
        });
    };

    const handleProduct = (event, product_id) => {
        let destination = "/products/" + product_id + "/view";
        history.push(destination);
    };

    const handleCategory = (event) => {
        event.cancelBubble = true;
        if(event.stopPropagation) event.stopPropagation();
        console.info("Category");
    };

    const handleAuthor = (event) => {
        event.cancelBubble = true;
        if(event.stopPropagation) event.stopPropagation();
        console.info("Author");
    };

    const handleFavouriteIcon = (product_id) => {
        let index = 0, products_quantity = state.products.length;
        while (index < products_quantity) {
            if (state.products[index].product_id === product_id) {
                break;
            }
            index += 1;
        }
        if (state.products[index].product_favourite) {
            return(
                <Tooltip title="Remove from favourite" aria-label="Remove from favourite">
                    <IconButton aria-label="Remove from favourite" className="product_icon_button" onClick={event => handleAddToFavourite(event, index, product_id)}>
                        <FavoriteIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>
            );
        } else {
            return(
                <Tooltip title="Add to favourite" aria-label="Add to favourite">
                    <IconButton aria-label="Add to favourite" className="product_icon_button" onClick={event => handleAddToFavourite(event, index, product_id)}>
                        <FavoriteBorderIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>
            )
        }
    }

    const handleAddToFavourite = (event, index, product_id) => {
        event.cancelBubble = true;
        if(event.stopPropagation) event.stopPropagation();
        const product_favourite = !state.products[index].product_favourite;
        const product = {
            ...state.products[index],
            "product_favourite": product_favourite
        };
        setState({
            ...state,
            "products": [...state.products.slice(0, index), product, ...state.products.slice(index + 1)]
        });
    }

    const handleEdit = (event, product_id) => {
        event.cancelBubble = true;
        if(event.stopPropagation) event.stopPropagation();
        history.push('/products/' + product_id + '/edit');
    }

    const handleAddNewProduct = () => {
        history.push('/products/new/edit');
    }

    let tab;

    if (state.products_group === 0) {
        //retrieve all products and set its values to product state field
    } else if (state.products_group === 1) {
        //retrieve new products and set its values to product state field
    } else {
        //retrieve favourite products and set its values to product state field
    }

    tab = <Grid container className="products_list" spacing={1}>
        { state.products.map((product, index) => (
            <Grid item key={index} id={product.product_id} className="product" onClick={event => handleProduct(event, product.product_id)}>
                <div className="product_image_container">
                    <img src={product.product_image} alt={product.product_name} className="product_image"/>
                </div>
                <div className="product_description">
                    <div className="product_name">
                        {product.product_name}
                    </div>
                    <div className="product_category">
                        <Chip
                            name="category"
                            size="small"
                            avatar={<CategoryIcon/>}
                            label={product.product_category}
                            onClick={handleCategory}
                        />
                    </div>
                    <div className="product_author" onClick={handleAuthor}>
                        <Avatar/>
                        <div className="product_author_name">{product.product_author}</div>
                    </div>
                </div>
                <div className="product_buttons">
                    <Tooltip title="Delete" aria-label="delete">
                        <IconButton aria-label="delete" className="product_icon_button">
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit" aria-label="edit">
                        <IconButton type="button" aria-label="edit" className="product_icon_button" onClick={(event) => handleEdit(event, product.product_id)}>
                            <EditIcon fontSize="small"/>
                        </IconButton>
                    </Tooltip>
                    {handleFavouriteIcon(product.product_id)}
                </div>
            </Grid>
        ))}
    </Grid>;

        return(
            <Container id="main_container" maxWidth="lg">
                <div className="page_container">
                    <h2>Products</h2>
                    <div className="toolbar_container">
                        <Tabs
                            name="products_group"
                            value={state.products_group}
                            indicatorColor="primary"
                            textColor="inherit"
                            onChange={handleTab}
                            aria-label="product groups buttons"
                        >
                            <Tab className="product_group_tab" label="All" />
                            <Tab className="product_group_tab" label="New" />
                            <Tab className="product_group_tab" label="Favourite" />
                        </Tabs>
                        <div>
                            <FormControl variant="filled">
                                <InputLabel htmlFor="search" className="search_input">Search</InputLabel>
                                <FilledInput
                                    id="search"
                                    name="search"
                                    className="search_input"
                                    placeholder="Type product name"
                                    value={state.search}
                                    onChange={handleChange}
                                />
                            </FormControl>
                            <FormControl variant="filled" className={classes.formControl}>
                                <InputLabel id="category_select_label" className="category_select">Category</InputLabel>
                                <Select
                                    labelId="category_select_label"
                                    id="category_select"
                                    className="category_select"
                                    name="category"
                                    value={state.category}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="Fruit">Fruit</MenuItem>
                                    <MenuItem value="Vegetables">Vegetables</MenuItem>
                                    <MenuItem value="Dairy">Dairy</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <Fab className="add_button" aria-label="add" onClick={handleAddNewProduct}>
                            <AddIcon />
                        </Fab>
                    </div>
                        {tab}
                </div>
            </Container>
        );
}