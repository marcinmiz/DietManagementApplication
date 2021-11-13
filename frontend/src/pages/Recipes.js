import React, {useEffect} from 'react'
import {Container, Divider, Grid, makeStyles, Tooltip} from "@material-ui/core";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from '@material-ui/core/InputLabel';
import FilledInput from '@material-ui/core/FilledInput';
import Fab from "@material-ui/core/Fab";
import AddIcon from '@material-ui/icons/Add';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Button from "@material-ui/core/Button";
import ConfirmationDialog from "../components/ConfirmationDialog";
import http from "../http-common";
import Rating from '@material-ui/lab/Rating';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import SuitableRecipeModal from "../components/SuitableRecipeModal";
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import {useHistory, useParams} from "react-router-dom";
import ViewerModal from "../components/ViewerModal";
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import CloudDownloadRoundedIcon from '@material-ui/icons/CloudDownloadRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import ReceiptIcon from '@material-ui/icons/Receipt';

const useStyles = makeStyles({
    paper: {
        width: '80%',
        maxHeight: 435,
    },
    photo_placeholder: {
        fontSize: 200
    }
});

export default function Recipes(props) {

    const history = useHistory();

    const classes = useStyles();

    let {recipeId, mode} = useParams();

    let recipes_parameters = {};

    // console.log("recipeId " + recipeId);
    // console.log("mode " + mode);

    const [state, setState] = React.useState({
        search: '',
        recipes_group: 0,//0: personal, 1: shared, 2: unconfirmed
        recipes: [
            // {"recipe_id": 1, "recipe_name": "Salmon with green beans and bacon", "recipe_author": "John Smith", "recipe_favourite": false, "recipe_shared": false, "recipe_image": "http://localhost:8097/api/images/get/recipe/recipe1.jpg", "creation_date": "7.08.2021 21:11:14", "assessment_date": "9.08.2021 21:11:14", "rejectExplanation": "", "approval_status": "accepted", "recipeCustomerSatisfactions": [{"rating_author": "John Smith", "rating_value": 0.2}, {"rating_author": "Derek Johnson", "rating_value": 3.5}, {"rating_author": "Kate Bell", "rating_value": 2.0}, {"rating_author": "Jessica Wells", "rating_value": 5.0}], "ingredients": [{"ingredient_name": "salmon fillet", "ingredient_quantity": 4, "ingredient_unit": "pcs"}, {"ingredient_name": "green beans", "ingredient_quantity": 450, "ingredient_unit": "g"}, {"ingredient_name": "butter", "ingredient_quantity": 2, "ingredient_unit": "tablespoons"}, {"ingredient_name": "smoked bacon", "ingredient_quantity": 2, "ingredient_unit": "slices"}, {"ingredient_name": "breadcrumbs", "ingredient_quantity": 2, "ingredient_unit": "tablespoons"}, {"ingredient_name": "olive oil", "ingredient_quantity": 3, "ingredient_unit": "tablespoons"}, {"ingredient_name": "water", "ingredient_quantity": 3, "ingredient_unit": "tablespoons"}], "steps": [{"step_number": 1, "step_name": "Cut each salmon fillet into 4 pieces and place them in ovenproof dish lined with parchment. Pour it some olive oil. Leave it for several minutes, then roast at 160 Celsius degrees for 15 minutes."}, {"step_number": 2, "step_name": "Cube smoked bacon and fry it up on the frying pan."}, {"step_number": 3, "step_name": "Blanch green beans, then strain it and add to smoked bacon. Stop frying after 1 minute."}, {"step_number": 4, "step_name": "Add butter to green beans and fry it for a few minutes."}, {"step_number": 5, "step_name": "Before you finish frying sprinkle its content with breadcrumbs. Serve with roasted salmon. You might append boiled rice."}]}
        ],
        hover_rating: -1,
        recipe_index: 'new',
        msg: "",
        loaded: false,
        open_confirmation_modal: false,
        complement: "",
        confirmation_recipe_id: null,
        confirmation_recipe_name: null,
        open_preference_suitability_popup: false,
        suitabilityRecipeId: null,
        suitabilityRecipeName: null,
        open_viewer_modal: false,
    });

    switch (state.recipes_group) {
        case 0:
            if (props.admin === true && props.adminMode === true) {
                recipes_parameters.recipesGroup = "accepted";
            } else {
                recipes_parameters.recipesGroup = "personal";
            }
            break;
        case 1:
            if (props.admin === true && props.adminMode === true) {
                recipes_parameters.recipesGroup = "pending";
            } else {
                recipes_parameters.recipesGroup = "shared";
            }
            break;
        case 2:
            if (props.admin === true && props.adminMode === true) {
                recipes_parameters.recipesGroup = "rejected";
            } else {
                recipes_parameters.recipesGroup = "unconfirmed";
            }
            break;
        default:
            recipes_parameters.recipesGroup = "";
            console.error("Wrong recipes group");
    }

    useEffect(
        async () => {
            setState({
                ...state,
                loaded: false
            });

            recipes_parameters.phrase = state.search;

            http.post("/api/recipes/getRecipesSuitabilities", recipes_parameters)
                .then(async resp => {
                    let table = [];

                    for (let x in resp.data) {
                        table[x] = await createRecipe(resp.data, x);
                    }

                    console.log(table);

                    let recipe_index = 'new';

                    if (recipeId !== 'new' && (mode === 'view' || mode === 'edit')) {

                        for (let i = 0; i < table.length; i++) {
                            if (table[i]) {
                                if (table[i].recipe_id === Number(recipeId)) {
                                    recipe_index = i;
                                }
                            }
                        }

                        // let resp = await http.get("/api/recipes/checkRecipeApprovalStatus/" + recipeId);
                        // let approvalStatus = resp.data.message;
                        //
                        // if (recipe_index === 'new') {
                        //     switch (approvalStatus) {
                        //         case 'accepted':
                        //             document.getElementById('first').click();
                        //             break;
                        //         case 'pending':
                        //             document.getElementById('second').click();
                        //             break;
                        //         case 'rejected':
                        //             if (props.adminMode) {
                        //                 document.getElementById('third').click();
                        //             } else {
                        //                 document.getElementById('second').click();
                        //             }
                        //             break;
                        //     }
                        // }
                    }

                    if ((!Number.isInteger(Number(recipeId)) && recipeId !== 'new') || (mode !== 'view' && mode !== 'edit')) {
                        history.push('/recipes');
                    }

                    setState({
                        ...state,
                        recipes: table,
                        loaded: true,
                        recipe_index: recipe_index,
                        open_viewer_modal: recipeId && mode && state.msg === "" ? true : false
                    });
                })
                .catch(error => console.log(error))

        }, [state.recipes_group, state.search, state.msg, props.adminMode, recipeId, mode]
    );

    const createRecipe = async (data, x) => {
        let recipe = {};
        recipe.positiveSuitabilities = data[x].positiveSuitabilities;
        recipe.negativeSuitabilities = data[x].negativeSuitabilities;
        recipe.recipe_id = data[x].recipe.recipeId;
        recipe.recipe_name = data[x].recipe.recipeName;
        recipe.recipe_author = data[x].recipe.recipeOwner.name + " " + data[x].recipe.recipeOwner.surname;
        recipe.recipe_author_id = data[x].recipe.recipeOwner.userId;
        recipe.recipe_author_image = data[x].recipe.recipeOwner.avatarImage;

        let ingredients_quantity = data[x].recipe.recipeProducts.length;
        recipe.recipe_ingredients = [];

        for (let i = 0; i < ingredients_quantity; i++) {
            recipe.recipe_ingredients[i] = {};
            recipe.recipe_ingredients[i].ingredient_name = data[x].recipe.recipeProducts[i].product.productName;
            recipe.recipe_ingredients[i].ingredient_amount = Number(data[x].recipe.recipeProducts[i].productAmount);
            recipe.recipe_ingredients[i].ingredient_unit = data[x].recipe.recipeProducts[i].productUnit;
        }

        let steps_quantity = data[x].recipe.recipeSteps.length;
        recipe.recipe_steps = [];

        for (let i = 0; i < steps_quantity; i++) {
            recipe.recipe_steps[i] = {};
            recipe.recipe_steps[i].step_number = i + 1;
            recipe.recipe_steps[i].step_name = data[x].recipe.recipeSteps[i].recipeStepDescription;
        }

        let customer_satisfactions_quantity = data[x].recipe.recipeCustomerSatisfactions.length;
        recipe.recipe_customer_satisfactions = [];

        for (let i = 0; i < customer_satisfactions_quantity; i++) {
            recipe.recipe_customer_satisfactions[i] = {};
            recipe.recipe_customer_satisfactions[i].customer_satisfaction_author = data[x].recipe.recipeCustomerSatisfactions[i].customerSatisfactionOwner.name + " " + data[x].recipe.recipeCustomerSatisfactions[i].customerSatisfactionOwner.surname;
            recipe.recipe_customer_satisfactions[i].customer_satisfaction_rating = Number(data[x].recipe.recipeCustomerSatisfactions[i].recipeRating);
            recipe.recipe_customer_satisfactions[i].customer_satisfaction_favourite = data[x].recipe.recipeCustomerSatisfactions[i].recipeFavourite;
        }

        recipe.recipe_shared = data[x].recipe.recipeShared;
        recipe.recipe_image = data[x].recipe.recipeImage;

        let creationDate = new Date(data[x].recipe.creationDate);
        recipe.creation_date = creationDate.toLocaleDateString() + " " + creationDate.toLocaleTimeString();
        recipe.approval_status = data[x].recipe.approvalStatus;
        if (recipe.assessmentDate !== null) {
            let assessmentDate = new Date(data[x].recipe.assessmentDate);
            recipe.assessment_date = assessmentDate.toLocaleDateString() + " " + assessmentDate.toLocaleTimeString();
            recipe.reject_explanation = data[x].recipe.rejectExplanation;
        }
        const response = await http.get("/api/recipes/checkIfInCollection/" + recipe.recipe_id);

        recipe.in_collection = response.data.message.endsWith("is in collection");

        return recipe;
    };

    const handleTab = (event, newValue) => {
        setState({
            ...state,
            recipes_group: newValue,
        });
    };

    const handleChange = (event) => {
        setState({
            ...state,
            [event.target.name]: event.target.value,
        });
    };

    const handleRecipe = (event, recipe_id) => {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
        history.push('/recipes/' + recipe_id + '/view');
    };

    const handleAuthor = (event) => {
        console.info("Author");
    };

    const handleEdit = (event, recipe_id) => {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
        history.push('/recipes/' + recipe_id + '/edit');
    };

    const handleAddNewProduct = () => {
        history.push('/recipes/new/edit');
    };

    const handleRemove = (event, index) => {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
        const recipe_id = state.recipes[index].recipe_id;

        http.delete("/api/recipes/remove/" + recipe_id)
            .then(resp => {
                handleOperationMessage(resp.data.message);
            })
            .catch(error => console.log(error));
    };

    const handleAssess = (event, recipe_id, recipe_name) => {
        // event.cancelBubble = true;
        // if (event.stopPropagation) event.stopPropagation();
        const name = event.target.innerText;
        setState({
            ...state,
            complement: name === "REJECT" ? "reject recipe " + recipe_name : "accept recipe " + recipe_name,
            open_confirmation_modal: true,
            confirmation_recipe_id: recipe_id,
            confirmation_recipe_name: recipe_name
        });
    };

    const handleCloseConfirmationPopup = () => {
        setState({
            ...state,
            open_confirmation_modal: false,
        });

    };

    const handleCloseViewerModal = () => {
        setState({
            ...state,
            open_viewer_modal: false
        });
        history.push("/recipes");
    };

    const handleFavouriteIcon = (index) => {

        let recipe_favourite = false;

        let satisfaction = state.recipes[index].recipe_customer_satisfactions;

        if (satisfaction) {
            satisfaction = satisfaction.filter(satisfaction => satisfaction.customer_satisfaction_author === props.name + " " + props.surname);
        }

        if (satisfaction && satisfaction[0])
            recipe_favourite = satisfaction[0].customer_satisfaction_favourite;

        if (recipe_favourite) {
            return (
                <Tooltip title="Remove from favourite" aria-label="Remove from favourite">
                    <IconButton aria-label="Remove from favourite" className="recipe_icon_button"
                                onClick={event => handleAddToFavourite(event, index)}>
                        <FavoriteIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>
            );
        } else {
            return (
                <Tooltip title="Add to favourite" aria-label="Add to favourite">
                    <IconButton aria-label="Add to favourite" className="recipe_icon_button"
                                onClick={event => handleAddToFavourite(event, index)}>
                        <FavoriteBorderIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>
            )
        }
    };

    const handleAddToFavourite = async (event, index) => {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();

        const recipeId = state.recipes[index].recipe_id;

        // let recipe_favourite = false;
        //
        // recipe_favourite = state.recipes[index].recipe_customer_satisfactions.filter(satisfaction => satisfaction.customer_satisfaction_author === props.name + " " + props.surname)[0].customer_satisfaction_favourite;

        let response = await http.put("/api/recipes/markFavourite/" + recipeId);

        if (response.data.message.startsWith("Recipe with id")) {
            setState({
                ...state,
                "msg": response.data.message
            });

            setTimeout(() => {
//                 const satisfactions = state.recipes[index].recipe_customer_satisfactions;
//                 console.log(satisfactions);
//                 const filteredSatisfactions = state.recipes[index].recipe_customer_satisfactions.filter(satisfaction => satisfaction.customer_satisfaction_author === props.name + " " + props.surname);
//                 console.log(filteredSatisfactions);
//                 const firstFilteredSatisfaction = state.recipes[index].recipe_customer_satisfactions.filter(satisfaction => satisfaction.customer_satisfaction_author === props.name + " " + props.surname)[0];
//                 console.log(firstFilteredSatisfaction);
//                 console.log(firstFilteredSatisfaction.customer_satisfaction_favourite);
// console.log(recipe_favourite);
//                 if (satisfactions && filteredSatisfactions && firstFilteredSatisfaction) {
//                     state.recipes[index].recipe_customer_satisfactions.find(customer_satisfaction => customer_satisfaction.customer_satisfaction_author === props.name + " " + props.surname)[0].customer_satisfaction_favourite = !recipe_favourite;
//                 }

                setState({
                    ...state,
                    "msg": ""
                });
            }, 3000);
        } else {
            console.error(response.data.message);
        }

    };

    const handleShare = async (event, index) => {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();

        const recipeId = state.recipes[index].recipe_id;

        const response = await http.get("/api/recipes/share/" + recipeId);

        if (response.data.message.endsWith("has been shared") || response.data.message.endsWith("has been unshared")) {
            setState({
                ...state,
                "msg": response.data.message
            });

            setTimeout(() => {
                state.recipes[index].recipe_shared = !state.recipes[index].recipe_shared;

                setState({
                    ...state,
                    "msg": ""
                });
            }, 3000);
        } else {
            console.error(response.data.message);
        }
    };

    const handleAddToCollection = async (event, recipeId) => {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();

        const response = await http.get("/api/recipes/addToCollection/" + recipeId);

        if (response.data.message.endsWith("has been added to collection") || response.data.message.endsWith("has been removed from collection")) {
            setState({
                ...state,
                "msg": response.data.message
            });

            setTimeout(() => {
                // state.recipes[index].recipe_shared = !state.recipes[index].recipe_shared;

                setState({
                    ...state,
                    "msg": ""
                });
            }, 3000);
        } else {
            console.error(response.data.message);
        }
    };

    const handleGeneralRating = (index) => {

        let ratings = state.recipes[index].recipe_customer_satisfactions;

        if (!ratings) {
            return 0;
        }

        if (ratings.filter(rating => rating.customer_satisfaction_rating != null).length < 1) {
            return 0;
        }

        let average_rating = ratings.flatMap(rating => rating.customer_satisfaction_rating).reduce((r1, r2) => r1 + r2) / ratings.length;
        return Math.round(average_rating * 1000) / 1000;
    };

    const handlePersonalRating = (index) => {

        let satisfaction = state.recipes[index].recipe_customer_satisfactions;

        if (!satisfaction)
            return 0;

        satisfaction = satisfaction.filter(satisfaction => satisfaction.customer_satisfaction_author === props.name + " " + props.surname);

        if (!satisfaction || !satisfaction[0] || satisfaction[0].customer_satisfaction_rating == null)
            return 0;

        return satisfaction[0].customer_satisfaction_rating;
    };

    const handlePersonalRatingEdit = async (event, index, newValue) => {

        console.log(index);

        const recipeId = state.recipes[index].recipe_id;
        console.log(recipeId);

        if (recipeId == null) {
            console.error("recipeId cannot be null");
            return;
        }

        let response = await http.put("/api/recipes/rate/" + recipeId + "/" + newValue);

        if(response.data.message.startsWith("Recipe with id")) {
            setState({
                ...state,
                "msg": "Recipe " + state.recipes[index].recipe_name + " has been rated"
            });

            setTimeout(() => {
                const satisfaction = state.recipes[index].recipe_customer_satisfactions.find(customer_satisfaction => customer_satisfaction.customer_satisfaction_author === props.name + " " + props.surname);

                if (satisfaction)
                    satisfaction.customer_satisfaction_rating = newValue;

                setState({
                    ...state,
                    "msg": ""
                });
            }, 3000);
        } else {
            console.error(response.data.message);
        }

    };
    const handleChangePersonalRating = async (event, index) => {
        console.log("change " + index);
    };
    const handleOpenPreferenceSuitabilityPopup = (event, suitabilityRecipeId, suitabilityRecipeName) => {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
        setState({
            ...state,
            open_preference_suitability_popup: true,
            suitabilityRecipeId: suitabilityRecipeId,
            suitabilityRecipeName: suitabilityRecipeName
        });
    };

    const handleClosePreferenceSuitabilityPopup = (event) => {
        setState({
            ...state,
            open_preference_suitability_popup: false
        });

    };

    const handleOperationMessage = (message) => {

        setState({
            ...state,
            msg: message,
        });
        setTimeout(() => {
            setState({
                ...state,
                msg: "",
                open_viewer_modal: false,
                open_confirmation_modal: false
            });
        }, 3000)
    };


    const handlePrevRecipe = () => {

        let new_index = state.recipe_index;
        let index = new_index - 1;

        while (true) {

            if (index < 0) {
                index = state.recipes.length;
            }

            if (state.recipes[index]) {
                new_index = index;
                break;
            }
            index--;
        }

        history.push('/recipes/' + state.recipes[new_index].recipe_id + '/' + mode);

    };

    const handleNextRecipe = () => {

        let new_index = state.recipe_index;
        let index = new_index + 1;

        while (true) {

            if (index > state.recipes.length) {
                index = 0;
            }

            if (state.recipes[index]) {
                new_index = index;
                break;
            }
            index++;
        }

        history.push('/recipes/' + state.recipes[new_index].recipe_id + '/' + mode);

    };

    let tab = null;
    if (props.admin === true && props.adminMode === true) {
        tab = <div className="unconfirmed_recipes_list">
            {state.recipes.map((recipe, index) => (
                <div key={index}>
                    <div id={"recipe" + recipe.recipe_id} className="unconfirmed_recipe">
                        <div className="recipe">
                            <div className="recipe_header">
                                <div className="recipe_name" onClick={event => handleRecipe(event, recipe.recipe_id)}>
                                    {recipe.recipe_name}
                                </div>
                                <div className="recipe_buttons">
                                    {state.recipes[index].recipe_author_id === props.userId ? <Tooltip title="Remove" aria-label="remove">
                                        <IconButton aria-label="remove" className="recipe_icon_button"
                                                    onClick={event => handleRemove(event, index)}>
                                            <DeleteIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip> : null}
                                    {state.recipes[index].recipe_author_id === props.userId ? <Tooltip title="Edit" aria-label="edit">
                                        <IconButton type="button" aria-label="edit" className="recipe_icon_button"
                                                    onClick={(event) => handleEdit(event, recipe.recipe_id)}>
                                            <EditIcon fontSize="small"/>
                                        </IconButton>
                                    </Tooltip> : null}
                                </div>
                            </div>
                            <div className="creation_date" onClick={event => handleRecipe(event, recipe.recipe_id)}>
                                {"created " + recipe.creation_date}
                            </div>

                            <div className="recipe_content">
                                <div className="recipe_image_container" onClick={event => handleRecipe(event, recipe.recipe_id)}>
                                    {recipe.recipe_image !== "" ? <img src={recipe.recipe_image} alt={recipe.recipe_name} className="recipe_image"/> :
                                        <ReceiptIcon className={classes.photo_placeholder}/>}
                                </div>
                                <div className="recipe_description">
                                    {/*<div className="recipe_category">*/}
                                    {/*<Chip*/}
                                    {/*name="category"*/}
                                    {/*size="small"*/}
                                    {/*avatar={<CategoryIcon/>}*/}
                                    {/*label={recipe.recipe_category}*/}
                                    {/*onClick={handleCategory}*/}
                                    {/*/>*/}
                                    {/*</div>*/}
                                    <div className="recipe_author" onClick={handleAuthor}>
                                        <Avatar src={recipe.recipe_author_image}/>
                                        <div className="recipe_author_name">{recipe.recipe_author}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="recipe_status">
                            <div className="unconfirmed_header">Status</div>
                            <Divider variant="fullWidth"/>
                            <div className={recipe.approval_status === "accepted"?"accepted_recipe unconfirmed_body":(recipe.approval_status === "pending"?"pending_recipe unconfirmed_body":"rejected_recipe unconfirmed_body")}>
                                {recipe.approval_status.toUpperCase()}
                            </div>
                        </div>
                        {recipe.approval_status === "pending"
                            ?
                            <div className="assessment_details">
                                <div>
                                    <Button name="accept" variant="contained" className="accept_button" onClick={(event) => handleAssess(event, recipe.recipe_id, recipe.recipe_name)}>Accept</Button>
                                </div>
                                <div>
                                    <Button name="reject" variant="contained" className="reject_button" onClick={event => handleAssess(event, recipe.recipe_id, recipe.recipe_name)}>Reject</Button>
                                </div>

                            </div>
                            :
                            <div className="assessment_details">
                                <div className="assessment_date">
                                    <div className="unconfirmed_header">Assessment Date</div>
                                    <Divider variant="fullWidth"/>
                                    <div className="unconfirmed_body">{recipe.assessment_date}</div>
                                </div>
                                {recipe.approval_status !== "accepted"
                                    ?
                                    <div className="reject_explanation">
                                        <div className="unconfirmed_header">Rejection explanation</div>
                                        <Divider variant="fullWidth"/>
                                        <div className="unconfirmed_body">{recipe.reject_explanation}</div>
                                    </div>
                                    :
                                    null}
                            </div>
                        }
                    </div>
                    <Divider variant="middle"/>
                </div>
            ))}

            <ConfirmationDialog
                classes={{
                    paper: classes.paper,
                }}
                id="confirmation_popup"
                type="recipe"
                open={state.open_confirmation_modal && state.msg === ''}
                onClose={handleCloseConfirmationPopup}
                complement = {state.complement}
                itemId = {state.confirmation_recipe_id}
                itemName = {state.confirmation_recipe_name}
                handleOperationMessage = {handleOperationMessage}
            />
        </div>;

    } else {
        switch (state.recipes_group) {
            case 0:
            case 1:
                tab = <div className="recipes_list">
                    <Grid container>
                        {state.recipes.map((recipe, index) => (
                            <Grid item key={index} id={"recipe" + recipe.recipe_id} className="recipe">
                                <div className="recipe_header">
                                    <div className="check_icons" onClick={event => handleOpenPreferenceSuitabilityPopup(event, recipe.recipe_id, recipe.recipe_name)}>
                                        <div className="check_passed">
                                            {recipe.positiveSuitabilities} <CheckIcon fontSize="small"/>
                                        </div>
                                        <div className="check_failed">
                                            {recipe.negativeSuitabilities} <ClearIcon fontSize="small"/>
                                        </div>
                                    </div>
                                    <div className="recipe_name" onClick={event => handleRecipe(event, recipe.recipe_id)}>
                                        {recipe.recipe_name}
                                        <div className="creation_date" onClick={event => handleRecipe(event, recipe.recipe_id)}>
                                            {"created " + recipe.creation_date}
                                        </div>
                                    </div>
                                    <div className="recipe_buttons">
                                        {handleFavouriteIcon(index)}
                                        {state.recipes[index].recipe_author_id === props.userId ? <Tooltip title="Remove" aria-label="remove">
                                            <IconButton aria-label="remove" className="recipe_icon_button"
                                                        onClick={event => handleRemove(event, index)}>
                                                <DeleteIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip> : null}
                                        {state.recipes[index].recipe_author_id === props.userId ? <Tooltip title="Edit" aria-label="edit">
                                            <IconButton type="button" aria-label="edit" className="recipe_icon_button"
                                                        onClick={(event) => handleEdit(event, recipe.recipe_id)}>
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        </Tooltip> : null}
                                        {state.recipes[index].recipe_author_id !== props.userId ? <Tooltip title={recipe.in_collection ? "Remove from collection" : "Add to collection"} aria-label={recipe.in_collection ? "Remove from collection" : "Add to collection"}>
                                            <IconButton type="button" aria-label={recipe.in_collection ? "Remove from collection" : "Add to collection"} className="recipe_icon_button"
                                                        onClick={(event) => handleAddToCollection(event, recipe.recipe_id)}
                                            >
                                                {recipe.in_collection ? <CloseRoundedIcon fontSize="small"/> : <ArrowDownwardRoundedIcon fontSize="small"/>}
                                            </IconButton>
                                        </Tooltip> : null}

                                    </div>
                                </div>

                                <div className="recipe_content">
                                    <div className="recipe_image_container" onClick={event => handleRecipe(event, recipe.recipe_id)}>
                                        {recipe.recipe_image !== "" ? <img src={recipe.recipe_image} alt={recipe.recipe_name} className="recipe_image"/> :
                                            <ReceiptIcon className={classes.photo_placeholder}/>}
                                    </div>
                                    <div className="recipe_description">
                                        {/*<div className="recipe_category">*/}
                                        {/*<Chip*/}
                                        {/*name="category"*/}
                                        {/*size="small"*/}
                                        {/*avatar={<CategoryIcon/>}*/}
                                        {/*label={recipe.recipe_category}*/}
                                        {/*onClick={handleCategory}*/}
                                        {/*/>*/}
                                        {/*</div>*/}
                                        <div className="recipe_author" onClick={handleAuthor}>
                                            <Avatar src={recipe.recipe_author_image}/>
                                            <div className="recipe_author_name">{recipe.recipe_author}</div>
                                        </div>
                                        <div className="recipe_actions">
                                            <div className="recipe_ratings_header">
                                                <div className="recipe_ratings">
                                                    General: {handleGeneralRating(index)} ({state.recipes[index].recipe_customer_satisfactions ? state.recipes[index].recipe_customer_satisfactions.length : 0} {state.recipes[index].recipe_customer_satisfactions ? (state.recipes[index].recipe_customer_satisfactions.length === 1 ? "rating" : "ratings") : "ratings"})
                                                </div>
                                                <Rating name="read-only" value={handleGeneralRating(index)} precision={0.1} readOnly/>
                                                <div className="recipe_ratings_header">
                                                    Personal rating
                                                </div>
                                                <Tooltip title={"Value: " + state.hover_rating !== -1 ? state.hover_rating : handlePersonalRating(index)} aria-label="rate" placement="top">
                                                    <Rating name={`rating${index}`} value={handlePersonalRating(index)} precision={0.1} onChange={(event, value) => handlePersonalRatingEdit(event,index, value)} onChangeActive={(event, newHover) => {
                                                        // console.log(index);
                                                        // console.log(recipe);
                                                        setState({...state, "hover_rating": newHover})
                                                    }}/>
                                                </Tooltip>
                                            </div>
                                            {state.recipes[index].recipe_shared ? <Tooltip title={state.recipes[index].recipe_author_id === props.userId ? "Cancel sharing" : "Only recipe owner can share recipe"} aria-label="Cancel sharing recipe"><Button variant="contained" className="shared_button" size="medium" onClick={event => handleShare(event, index)} disabled={state.recipes[index].recipe_author_id !== props.userId}>Shared</Button></Tooltip> : <Tooltip title="Share recipe" aria-label="Share"><Button variant="contained" color="primary" size="medium" onClick={event => handleShare(event, index)}>Share</Button></Tooltip>}

                                        </div>
                                    </div>

                                </div>

                            </Grid>
                        ))}
                    </Grid>

                    {state.loaded && state.suitabilityRecipeId && <SuitableRecipeModal
                        open={state.open_preference_suitability_popup}
                        onClose={handleClosePreferenceSuitabilityPopup}
                        recipeId={state.suitabilityRecipeId}
                        recipeName={state.suitabilityRecipeName}
                    />}
                </div>;
                break;
            case 2:
                tab = <div className="unconfirmed_recipes_list">
                    {state.recipes.map((recipe, index) => (
                        <div key={index}>
                            <div id={"recipe" + recipe.recipe_id} className="unconfirmed_recipe">
                                <div className="recipe">
                                    <div className="recipe_header">
                                        <div className="recipe_name" onClick={event => handleRecipe(event, recipe.recipe_id)}>
                                            {recipe.recipe_name}
                                        </div>
                                        <div className="recipe_buttons">
                                            {state.recipes[index].recipe_author_id === props.userId ? <Tooltip title="Remove" aria-label="remove">
                                                <IconButton aria-label="remove" className="recipe_icon_button"
                                                            onClick={event => handleRemove(event, index)}>
                                                    <DeleteIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip> : null}
                                            {state.recipes[index].recipe_author_id === props.userId ? <Tooltip title="Edit" aria-label="edit">
                                                <IconButton type="button" aria-label="edit" className="recipe_icon_button"
                                                            onClick={(event) => handleEdit(event, recipe.recipe_id)}>
                                                    <EditIcon fontSize="small"/>
                                                </IconButton>
                                            </Tooltip> : null}
                                        </div>
                                    </div>
                                    <div className="creation_date" onClick={event => handleRecipe(event, recipe.recipe_id)}>
                                        {"created " + recipe.creation_date}
                                    </div>

                                    <div className="recipe_content">
                                        <div className="recipe_image_container" onClick={event => handleRecipe(event, recipe.recipe_id)}>
                                            {recipe.recipe_image !== "" ? <img src={recipe.recipe_image} alt={recipe.recipe_name} className="recipe_image"/> :
                                                <ReceiptIcon className={classes.photo_placeholder}/>}
                                        </div>
                                        <div className="recipe_description">
                                            {/*<div className="recipe_category">*/}
                                            {/*<Chip*/}
                                            {/*name="category"*/}
                                            {/*size="small"*/}
                                            {/*avatar={<CategoryIcon/>}*/}
                                            {/*label={recipe.recipe_category}*/}
                                            {/*onClick={handleCategory}*/}
                                            {/*/>*/}
                                            {/*</div>*/}
                                            <div className="recipe_author" onClick={handleAuthor}>
                                                <Avatar src={recipe.recipe_author_image}/>
                                                <div className="recipe_author_name">{recipe.recipe_author}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="recipe_status">
                                    <div className="unconfirmed_header">Status</div>
                                    <Divider variant="fullWidth"/>
                                    <div className={recipe.approval_status === "pending"?"pending_recipe unconfirmed_body":"rejected_recipe unconfirmed_body"}>
                                        {recipe.approval_status.toUpperCase()}
                                    </div>
                                </div>
                                {recipe.approval_status === "pending"
                                    ?
                                    <div className="assessment_details">
                                        This product has not been assessed yet
                                    </div>
                                    :
                                    <div className="assessment_details">
                                        <div className="assessment_date">
                                            <div className="unconfirmed_header">Assessment Date</div>
                                            <Divider variant="fullWidth"/>
                                            <div className="unconfirmed_body">{recipe.assessment_date}</div>
                                        </div>
                                        <div className="reject_explanation">
                                            <div className="unconfirmed_header">Rejection explanation</div>
                                            <Divider variant="fullWidth"/>
                                            <div className="unconfirmed_body">{recipe.reject_explanation}</div>
                                        </div>
                                    </div>
                                }
                            </div>
                            <Divider variant="middle"/>
                        </div>
                    ))}

                </div>;
                break;
        }

    }

    return (
        <Container id="main_container" maxWidth="lg">
            <div className={(state.open_viewer_modal || state.open_confirmation_modal) && state.msg === '' ? "background_blur page_container" : "page_container"}>
                <h2>Recipes</h2>
                <div className="toolbar_container">

                    {props.admin === true && props.adminMode === true ?
                        <Tabs
                            name="recipes_group"
                            value={state.recipes_group}
                            indicatorColor="primary"
                            textColor="inherit"
                            onChange={handleTab}
                            aria-label="recipe groups buttons"
                        >
                            <Tab className="recipe_group_tab" label="Accepted"/>
                            <Tab className="recipe_group_tab" label="Pending"/>
                            <Tab className="recipe_group_tab" label="Rejected"/>
                        </Tabs>
                        :
                        <Tabs
                            name="recipes_group"
                            value={state.recipes_group}
                            indicatorColor="primary"
                            textColor="inherit"
                            onChange={handleTab}
                            aria-label="recipe groups buttons"
                        >
                            <Tab className="recipe_group_tab" label="Personal"/>
                            <Tab className="recipe_group_tab" label="Shared"/>
                            <Tab className="recipe_group_tab" label="Unconfirmed"/>
                        </Tabs>
                    }
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
                        {/*<FormControl variant="filled" className={classes.formControl}>*/}
                        {/*<InputLabel id="category_select_label" className="category_select">Category</InputLabel>*/}
                        {/*<Select*/}
                        {/*labelId="category_select_label"*/}
                        {/*id="category_select"*/}
                        {/*className="category_select"*/}
                        {/*name="category"*/}
                        {/*value={state.category}*/}
                        {/*onChange={handleChange}*/}
                        {/*>*/}
                        {/*{state.categories.map((category, index) => (*/}
                        {/*<MenuItem key={index} value={category.category_name}>{category.category_name}</MenuItem>*/}
                        {/*))}*/}
                        {/*</Select>*/}
                        {/*</FormControl>*/}
                    </div>
                    <Fab className="add_button" aria-label="add" onClick={handleAddNewProduct}>
                        <AddIcon/>
                    </Fab>
                </div>
                {state.msg !== "" ? <div className="msg">{state.msg}</div> : null}
                {state.recipes.length === 0 ?
                    <div className="loading">{!state.loaded ? "Loading" : "No recipes found"}</div> : null}
                {tab}
                {recipeId && state.recipes.length > 0 && mode && <ViewerModal
                    open={state.open_viewer_modal}
                    onClose={handleCloseViewerModal}
                    type="recipe"
                    item_index={state.recipe_index}
                    items={state.recipes}
                    mode={mode}
                    loggedInStatus={props.loggedInStatus}
                    handleOperationMessage={handleOperationMessage}
                    handlePrevProduct={handlePrevRecipe}
                    handleNextProduct={handleNextRecipe}
                    header={recipes_parameters.recipesGroup}
                    name={props.name}
                    surname={props.surname}
                    userId={props.userId}
                />}
            </div>
        </Container>
    );

}