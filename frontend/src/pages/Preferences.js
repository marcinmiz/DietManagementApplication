import React, {useEffect} from 'react'
import {Container, Divider, makeStyles, Tooltip} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import http from "../http-common";
import ThumbDownRoundedIcon from '@material-ui/icons/ThumbDownRounded';
import ThumbUpRoundedIcon from '@material-ui/icons/ThumbUpRounded';
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import DietaryPreferenceEdit from "../components/DietaryPreferenceEdit";

const useStyles = makeStyles((theme) => ({
    formControl: {
        minWidth: 110,
    }
}));

export default function Preferences(props) {
    const classes = useStyles();

    const [state, setState] = React.useState({
        preferences: [],
        msg: "",
        editPreferenceId: null,
        loaded: false
    });

    useEffect(
        async () => {

            http.get("/api/preferences")
                .then(async resp => {
                    let table = [];

                    for (let x in resp.data) {
                        table[x] = createPreference(resp.data, x);
                    }

                    setState({
                        ...state,
                        preferences: table,
                        loaded: true,
                    });
                })
                .catch(error => console.log(error))

        }, [state.msg, state.search, props.adminMode]
    );

    const createPreference = (data, x) => {
        let preference = {};

        preference.preferenceId = data[x].dietaryPreferenceId;
        preference.totalDailyCalories = data[x].totalDailyCalories;
        preference.preferenceOwner = data[x].preferenceOwner.name + " " + data[x].preferenceOwner.surname;

        preference.preferenceDietType = {};
        preference.preferenceDietType.dietTypeName = "";

        if (data[x].dietType) {
            preference.preferenceDietType.dietTypeId = data[x].dietType.dietTypeId;
            preference.preferenceDietType.dietTypeName = data[x].dietType.dietTypeName;
            preference.preferenceDietType.proteinCoefficient = data[x].dietType.proteinCoefficient;
            preference.preferenceDietType.carbohydrateCoefficient = data[x].dietType.carbohydrateCoefficient;
            preference.preferenceDietType.fatCoefficient = data[x].dietType.fatCoefficient;
        }

        preference.caloriesPerMeal = data[x].caloriesPerMeal;
        preference.mealsQuantity = data[x].mealsQuantity;
        preference.targetWeight = data[x].targetWeight;
        let creationDate = new Date(data[x].creationDate);
        preference.creationDate = creationDate.toLocaleDateString() + " " + creationDate.toLocaleTimeString();

        let nutrients_quantity = data[x].nutrients.length;
        preference.preferenceNutrients = [];

        for (let i = 0; i < nutrients_quantity; i++) {
            preference.preferenceNutrients[i] = {};
            preference.preferenceNutrients[i].nutrientName = data[x].nutrients[i].nutrient.nutrientName;
            preference.preferenceNutrients[i].nutrientAmount = data[x].nutrients[i].nutrientAmount;
            preference.preferenceNutrients[i].nutrientRelation = data[x].nutrients[i].nutrientRelation;
        }

        let products_quantity = data[x].products.length;
        preference.preferenceProducts = [];

        for (let i = 0; i < products_quantity; i++) {
            preference.preferenceProducts[i] = {};
            preference.preferenceProducts[i].productName = data[x].products[i].product.productName;
            preference.preferenceProducts[i].productImage = data[x].products[i].product.productImage;
            preference.preferenceProducts[i].productPreferred = data[x].products[i].productPreferred;
        }

        let recipes_quantity = data[x].recipes.length;
        preference.preferenceRecipes = [];

        for (let i = 0; i < recipes_quantity; i++) {
            preference.preferenceRecipes[i] = {};
            preference.preferenceRecipes[i].recipeName = data[x].recipes[i].recipe.recipeName;
            preference.preferenceRecipes[i].recipeImage = data[x].recipes[i].recipe.recipeImage;
            preference.preferenceRecipes[i].recipePreferred = data[x].recipes[i].recipePreferred;
        }

        preference.relatedDietaryProgramme = {};
        preference.relatedDietaryProgramme.dietaryProgrammeName = "";

        if (data[x].relatedDietaryProgramme) {
            preference.relatedDietaryProgramme.dietaryProgrammeId = data[x].relatedDietaryProgramme.dietaryProgrammeId;
            preference.relatedDietaryProgramme.dietaryProgrammeName = data[x].relatedDietaryProgramme.dietaryProgrammeName;
            preference.relatedDietaryProgramme.dietaryProgrammeDays = data[x].relatedDietaryProgramme.dietaryProgrammeDays;
        }

        return preference;
    };

    const handleEdit = (event, preferenceId) => {
        if (!state.editPreferenceId) {
            setState({
                ...state,
                editPreferenceId: preferenceId
            });
        } else {
            setState({
                ...state,
                editPreferenceId: null
            });
        }
    };

    const handleSetMsg = (newMsg) => {
        setState({
            ...state,
            msg: newMsg
        });
    };

    const handleRemove = (event, preferenceId) => {
        http.delete("/api/preferences/remove/" + preferenceId)
            .then(resp => {
                handleSetMsg(resp.data.message);
                setTimeout(() => handleSetMsg(""), 3000);
            })
            .catch(error => console.log(error));
    };

    return (
        <Container id="main_container" maxWidth="lg">
            <div className="page_container">
                <h2>Dietary Preferences</h2>
                {state.msg !== "" ? <div className="msg">{state.msg}</div> : null}
                <div className="toolbar_container">
                    <Accordion className="add_button add_preference">
                        <AccordionSummary
                            expandIcon={<AddIcon/>}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            Add new dietary preference
                        </AccordionSummary>
                        <AccordionDetails>
                            <DietaryPreferenceEdit mode='add' handleSetMsg={handleSetMsg}/>
                        </AccordionDetails>
                    </Accordion>
                </div>
                {state.preferences.length === 0 ?
                    <div className="loading">{!state.loaded ? "Loading" : "No dietary preferences found"}</div> : null}
                <div className="dietary_preferences_list">

                    {state.preferences.map((preference, index) => (
                        <div key={index}>
                            <Divider variant="fullWidth"/>
                            {state.editPreferenceId === preference.preferenceId ?
                                <DietaryPreferenceEdit mode='edit' item={preference} handleEdit={handleEdit}
                                                       handleSetMsg={handleSetMsg}/>
                                :
                                <div id={"preference" + preference.preferenceId}
                                     className="dietary_preference">
                                    <div className="preference_basic_info">
                                        <div>
                                            {index + 1}. Dietary Preference
                                        </div>
                                        <div className="creation_date">
                                            {"created " + preference.creationDate}
                                        </div>
                                        <div className="dietary_preference_diet_type">
                                            Diet
                                            type: {preference.preferenceDietType.dietTypeName !== "" ? preference.preferenceDietType.dietTypeName : "CUSTOMIZED DIET"}
                                        </div>
                                    </div>
                                    <div className="preference_details">
                                        <div className="dietary_preference_total_daily_calories">
                                            Total daily calories: {preference.totalDailyCalories} kCal
                                        </div>
                                        <div className="dietary_preference_calories_per_meal">
                                            Calories per meal: {preference.caloriesPerMeal} kCal
                                        </div>
                                        <div className="dietary_preference_meals_quantity">
                                            Meals quantity: {preference.mealsQuantity}
                                        </div>
                                        <div className="dietary_preference_target_weight">
                                            Target weight: {preference.targetWeight} kg
                                        </div>
                                    </div>
                                    <div className="preference_nutrients">
                                        <div className="preference_nutrients_header">Nutrients</div>
                                        {preference.preferenceNutrients.length === 0 ? "No nutrients" :
                                            preference.preferenceNutrients.map((nutrient, index) => (
                                                <div key={index} className="preference_nutrient">
                                                    <div>
                                                        {nutrient.nutrientName}
                                                    </div>
                                                    <div>
                                                        {nutrient.nutrientRelation}
                                                        {nutrient.nutrientAmount} g
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    <div className="preference_products">
                                        <div className="preference_products_header">Products</div>
                                        {preference.preferenceProducts.length === 0 ? "No preferred products" :
                                            preference.preferenceProducts.map((product, index) => (
                                                <div key={index} className="preference_product">
                                                    <div>
                                                        {product.productName}
                                                    </div>
                                                    <div>
                                                        {product.productPreferred ?
                                                            <ThumbUpRoundedIcon className="upThumb"/> :
                                                            <ThumbDownRoundedIcon className="downThumb"/>}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    <div className="preference_recipes">
                                        <div className="preference_recipes_header">Recipes</div>
                                        {preference.preferenceRecipes.length === 0 ? "No preferred recipes" :
                                            preference.preferenceRecipes.map((recipe, index) => (
                                                <div key={index} className="preference_recipe">
                                                    <div>
                                                        {recipe.recipeName}
                                                    </div>
                                                    <div>
                                                        {recipe.recipePreferred ?
                                                            <ThumbUpRoundedIcon className="upThumb"/> :
                                                            <ThumbDownRoundedIcon className="downThumb"/>}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    <div className="product_buttons">
                                        <Tooltip title="Delete" aria-label="delete">
                                            <IconButton aria-label="delete" className="product_icon_button"
                                                        onClick={event => handleRemove(event, preference.preferenceId)}
                                            >
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Edit" aria-label="edit">
                                            <IconButton type="button" aria-label="edit" className="product_icon_button"
                                                        onClick={(event) => handleEdit(event, preference.preferenceId)}
                                            >
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </div>}
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}