package agh.edu.pl.diet.services.impl;

import agh.edu.pl.diet.entities.*;
import agh.edu.pl.diet.payloads.request.ItemAssessRequest;
import agh.edu.pl.diet.payloads.request.RecipeGetRequest;
import agh.edu.pl.diet.payloads.request.RecipeRequest;
import agh.edu.pl.diet.payloads.request.RecipeSearchRequest;
import agh.edu.pl.diet.payloads.response.RecipeResponse;
import agh.edu.pl.diet.payloads.response.ResponseMessage;
import agh.edu.pl.diet.payloads.response.SuitabilityRecipeResponse;
import agh.edu.pl.diet.repos.*;
import agh.edu.pl.diet.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecipeServiceImpl implements RecipeService {

    private final List<String> recipeProductUnits = Arrays.asList("kg", "dag", "g", "pcs", "ml", "l", "tsp", "tbsp");

    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private RecipeRepo recipeRepo;
    @Autowired
    private CollectionRecipeRepo collectionRecipeRepo;
    @Autowired
    private RecipeCustomerSatisfactionsRepo recipeCustomerSatisfactionsRepo;
    @Autowired
    private RecipeProductsRepo recipeProductsRepo;
    @Autowired
    private RecipeStepsRepo recipeStepsRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private UserService userService;
    @Autowired
    private ImageService imageService;
    @Autowired
    private DietaryPreferencesService preferencesService;
    @Autowired
    private DailyMenuService menuService;
    private Product ingredient = null;

    private ResponseMessage verify(String type, Object item) {
        switch (type) {
            case "name":

                if (item == null) {
                    return new ResponseMessage("Recipe name has to be given");
                }

                String name = String.valueOf(item);

                if (name.length() < 2 || name.length() > 40) {
                    return new ResponseMessage("Recipe name has to have min 2 and max 40 characters");
                } else if (!(name.matches("^[a-zA-Z ]+$"))) {
                    return new ResponseMessage("Recipe name has to contain only letters and spaces");
                } else {
                    return new ResponseMessage("Recipe name is valid");
                }

            case "recipeProducts":
                List<String> recipeProducts = (List<String>) item;
                if (recipeProducts == null) {
                    return new ResponseMessage("Recipe products has to be given");
                } else if (recipeProducts.isEmpty()) {
                    return new ResponseMessage("At least 1 recipe product is required");
                } else {
                    return new ResponseMessage("Recipe products are valid");
                }

            case "recipeProductStatement":
                String recipeProductStatement = String.valueOf(item);
                if (recipeProductStatement.equals("")) {
                    return new ResponseMessage("Recipe product has to be defined");
                } else if (!(recipeProductStatement.matches("^[a-zA-Z ]+;0(.\\d+)?;[a-zA-Z]+$") || recipeProductStatement.matches("^[a-zA-Z ]+;(-)?[1-9]+[0-9]*(.\\d+)?;[a-zA-Z]+$"))) {
                    return new ResponseMessage("Recipe product has to match format \"recipeProductName;recipeProductAmount;recipeProductUnit\". Recipe product name may contain letters and spaces, recipe product amount may contain digits optionally divided by dot and recipe product unit may have value: \"g\", \"dag\", \"kg\", \"pcs\", \"ml\" or \"l\"");
                } else {
                    return new ResponseMessage("Recipe product statement is valid");
                }
            case "recipeProductName":
                String recipeProductName = String.valueOf(item);

                if (productRepo.findByProductName(recipeProductName) == null) {
                    return new ResponseMessage("Recipe product name has to be proper");
                } else {
                    ingredient = productRepo.findByProductName(recipeProductName);
                    return new ResponseMessage("Recipe product name is valid");
                }
            case "recipeProductAmount":
                Double recipeProductAmount = Double.valueOf(item.toString());

                if (recipeProductAmount.toString().length() < 1 || recipeProductAmount.toString().length() > 20) {
                    return new ResponseMessage("Recipe product amount has to have min 1 and max 20 characters");
                } else if (recipeProductAmount <= 0) {
                    return new ResponseMessage("Recipe product amount has to be greater than 0");
                } else {
                    return new ResponseMessage("Recipe product amount is valid");
                }
            case "recipeProductUnit":
                String recipeProductUnit = String.valueOf(item);
                String productType = null;
                if (ingredient != null) {
                    productType = ingredient.getProductType();
                    List<String> units;

                    switch (productType) {
                        case "by weight":
                            units = recipeProductUnits.subList(0, 3);
                            if (!units.contains(recipeProductUnit)) {
                                return new ResponseMessage("By weight product might have one of units: \"g\", \"dag\" or \"kg\"");
                            }
                            break;
                        case "pieces":
                            units = recipeProductUnits.subList(3, 4);
                            if (!units.contains(recipeProductUnit)) {
                                return new ResponseMessage("Pieces product might have unit: \"pcs\"");
                            }
                            break;
                        case "liquid":
                            units = recipeProductUnits.subList(4, 8);
                            if (!units.contains(recipeProductUnit)) {
                                return new ResponseMessage("Liquid product might have one of units: \"ml\", \"l\", \"tbsp\" or \"tsp\"");
                            }
                            break;
                        default:
                            return new ResponseMessage("Wrong product type. Proper product types: \"by weight\", \"pieces\" and \"liquid\"");
                    }
//
//                if (!recipeProductUnits.contains(recipeProductUnit)) {
//                    return new ResponseMessage("Recipe product unit has to be proper");
//                }
                    ingredient = null;
                    return new ResponseMessage("Recipe product unit is valid");
                }
                return new ResponseMessage("Checked product is null");

            case "recipeSteps":
                List<String> recipeSteps = (List<String>) item;
                if (recipeSteps == null) {
                    return new ResponseMessage("Recipe steps has to be given");
                } else if (recipeSteps.isEmpty()) {
                    return new ResponseMessage("At least 1 recipe step is required");
                } else {
                    return new ResponseMessage("Recipe steps are valid");
                }
            case "recipeStepStatement":
                String recipeStepStatement = String.valueOf(item);
                if (recipeStepStatement.equals("")) {
                    return new ResponseMessage("Recipe step has to be defined");
                } else if (recipeStepStatement.length() < 3 || recipeStepStatement.length() > 100) {
                    return new ResponseMessage("Recipe step has to have min 3 and max 100 characters");
                } else if (!(recipeStepStatement.matches("^[a-zA-Z,. 0-9]+$"))) {
                    return new ResponseMessage("Recipe step has to match format \"recipeStep\" and contains only digits, lowercase and uppercase letters with spaces, commas and dots");
                } else {
                    return new ResponseMessage("Recipe step statement is valid");
                }
        }

        return new ResponseMessage("Invalid type");
    }

    @Override
    public List<Recipes> getAllRecipes() {
        String item_type = "recipe";
        String recipe_owner_type = "avatar";
        List<Recipes> list = new ArrayList<>();
        recipeRepo.findAll().forEach(list::add);

        for (Recipes recipe : list) {
            String url = imageService.getImageURL(item_type, recipe.getRecipeId());
            recipe.setRecipeImage(url);
            String avatarUrl = imageService.getImageURL(recipe_owner_type, recipe.getRecipeOwner().getUserId());
            recipe.getRecipeOwner().setAvatarImage(avatarUrl);

        }

        return list;
    }

    @Override
    public Recipes getRecipe(Long recipeId) {
        String item_type = "recipe";
        String recipe_owner_type = "avatar";
        String url = imageService.getImageURL(item_type, recipeId);
        Recipes recipe = recipeRepo.findById(recipeId).get();
        recipe.setRecipeImage(url);
        String avatarUrl = imageService.getImageURL(recipe_owner_type, recipe.getRecipeOwner().getUserId());
        recipe.getRecipeOwner().setAvatarImage(avatarUrl);
        return recipe;
    }

    @Override
    public List<Recipes> getRecipes(RecipeGetRequest recipeGetRequest) {

        RecipeSearchRequest recipeSearchRequest = new RecipeSearchRequest();
        recipeSearchRequest.setPhrase(recipeGetRequest.getPhrase());

        List<Recipes> recipesList = searchRecipes(recipeSearchRequest);

        User currentLoggedUser = userService.findByUsername(userService.getLoggedUser().getUsername());
        if (currentLoggedUser == null) {
            return new ArrayList<>();
        }

        switch (recipeGetRequest.getRecipesGroup()) {
            case "personal":

                List<CollectionRecipe> collection = collectionRecipeRepo.findByRecipeCollector(currentLoggedUser);

                if (collection == null) {
                    return new ArrayList<>();
                }

                List<Recipes> recipesCollection = collection.stream().map(CollectionRecipe::getRecipe).collect(Collectors.toList());

                recipesList = recipesList.stream().filter(recipe -> recipe.getApprovalStatus().equals("accepted") && recipesCollection.contains(recipe)).collect(Collectors.toList());
                break;
            case "shared":
                recipesList = recipesList.stream().filter(recipe -> recipe.getApprovalStatus().equals("accepted")).collect(Collectors.toList());
                recipesList = recipesList.stream().filter(Recipes::getRecipeShared).collect(Collectors.toList());
                break;
            case "unconfirmed":
                recipesList = recipesList.stream().filter(recipe -> recipe.getRecipeOwner().getUserId().equals(currentLoggedUser.getUserId())).collect(Collectors.toList());
                recipesList = recipesList.stream().filter(recipe -> recipe.getApprovalStatus().equals("pending") || recipe.getApprovalStatus().equals("rejected")).collect(Collectors.toList());
                break;
            case "accepted":
                recipesList = recipesList.stream().filter(recipe -> recipe.getApprovalStatus().equals("accepted")).collect(Collectors.toList());
                break;
            case "pending":
                recipesList = recipesList.stream().filter(recipe -> recipe.getApprovalStatus().equals("pending")).collect(Collectors.toList());
                break;
            case "rejected":
                recipesList = recipesList.stream().filter(recipe -> recipe.getApprovalStatus().equals("rejected")).collect(Collectors.toList());
                break;
            case "favourite":
                recipesList = recipesList.stream().filter(recipe -> {
                    List<Recipes> favouriteRecipes = recipe.getRecipeCustomerSatisfactions().stream().filter(satisfaction -> satisfaction.getRecipeFavourite() && satisfaction.getCustomerSatisfactionOwner().getUserId().equals(currentLoggedUser.getUserId())).map(RecipeCustomerSatisfaction::getRecipe).collect(Collectors.toList());
                    return recipe.getApprovalStatus().equals("accepted") && favouriteRecipes.contains(recipe);
                }).collect(Collectors.toList());
                break;
            default:
                recipesList = null;
        }

        if (recipesList != null) {
            Integer groupNumber = recipeGetRequest.getGroupNumber();
            recipesList = recipesList.stream().skip(groupNumber * 10).collect(Collectors.toList());
            if (!recipeGetRequest.getAll().equals("yes")) {
                recipesList = recipesList.stream().limit(10).collect(Collectors.toList());
            }
        }

        return recipesList;
    }

    @Override
    public List<RecipeResponse> getRecipesSuitabilities(RecipeGetRequest recipeGetRequest) {
        List<Recipes> list = getRecipes(recipeGetRequest);
        List<RecipeResponse> recipesWithSuitability = new ArrayList<>();

        Integer positiveSuitabilities = 0, negativeSuitabilities = 0, suitabilitiesCounter = 0;

        for (Recipes recipe : list) {

            List<List<SuitabilityRecipeResponse>> suitability = checkRecipeSuitability(recipe.getRecipeId());
            for (List<SuitabilityRecipeResponse> recipeResponses: suitability) {
                for (SuitabilityRecipeResponse response: recipeResponses) {
                    if (response.getSuitable()) {
                        suitabilitiesCounter++;
                    }
                }

                if (suitabilitiesCounter > 0) {
                    positiveSuitabilities++;
                } else {
                    negativeSuitabilities++;
                }

                suitabilitiesCounter = 0;
            }

            recipesWithSuitability.add(new RecipeResponse(recipe, positiveSuitabilities, negativeSuitabilities));

            positiveSuitabilities = 0;
            negativeSuitabilities = 0;
        }

        return recipesWithSuitability;
    }

    @Override
    public ResponseMessage addNewRecipe(RecipeRequest recipeRequest) {
        Recipes recipe = new Recipes();
        String recipeName = recipeRequest.getRecipeName();

        ResponseMessage responseMessage = verify("name", recipeName);
        if (responseMessage.getMessage().equals("Recipe name is valid")) {
            recipe.setRecipeName(recipeName);
        } else {
            return responseMessage;
        }

        List<String> recipeProducts = recipeRequest.getRecipeProducts();

        ResponseMessage responseMessage4 = verify("recipeProducts", recipeProducts);

        if (!(responseMessage4.getMessage().equals("Recipe products are valid"))) {
            return responseMessage4;
        }

        for (String recipeProductStatement : recipeProducts) {

            ResponseMessage responseMessage5 = verify("recipeProductStatement", recipeProductStatement);

            if (!(responseMessage5.getMessage().equals("Recipe product statement is valid"))) {
                return responseMessage5;
            }
            String[] parts = recipeProductStatement.split(";");
            String recipeProductName = parts[0];
            Double recipeProductAmount = Double.valueOf(parts[1]);
            String recipeProductUnit = parts[2];

            ResponseMessage responseMessage6 = verify("recipeProductName", recipeProductName);

            if (!(responseMessage6.getMessage().equals("Recipe product name is valid"))) {
                return responseMessage6;
            }

            ResponseMessage responseMessage7 = verify("recipeProductAmount", recipeProductAmount);

            if (!(responseMessage7.getMessage().equals("Recipe product amount is valid"))) {
                return responseMessage7;
            }

            ResponseMessage responseMessage8 = verify("recipeProductUnit", recipeProductUnit);

            if (!(responseMessage8.getMessage().equals("Recipe product unit is valid"))) {
                return responseMessage8;
            }

            Product product = productRepo.findByProductName(recipeProductName);
            RecipeProduct recipeProduct = new RecipeProduct();
            recipeProduct.setProduct(product);
            recipeProduct.setProductAmount(recipeProductAmount);
            recipeProduct.setProductUnit(recipeProductUnit);
            recipeProduct.setRecipe(recipe);
            recipe.addRecipeProduct(recipeProduct);
        }

        List<String> recipeSteps = recipeRequest.getRecipeSteps();

        ResponseMessage responseMessage9 = verify("recipeSteps", recipeSteps);

        if (!(responseMessage9.getMessage().equals("Recipe steps are valid"))) {
            return responseMessage9;
        }

        for (String recipeStepStatement : recipeSteps) {

            ResponseMessage responseMessage10 = verify("recipeStepStatement", recipeStepStatement);

            if (!(responseMessage10.getMessage().equals("Recipe step statement is valid"))) {
                return responseMessage10;
            }

            RecipeStep recipeStep = new RecipeStep();
            recipeStep.setRecipeStepDescription(recipeStepStatement);
            recipeStep.setRecipe(recipe);
            recipe.addRecipeStep(recipeStep);
        }

        //change to logged in user id
        User recipeOwner = userService.findByUsername(userService.getLoggedUser().getUsername());
        if (recipeOwner == null) {
            return new ResponseMessage("Recipe " + recipeName + " owner has not been found");
        }

        recipe.setRecipeOwner(recipeOwner);
        String creationDate = new Date().toInstant().toString();
        recipe.setCreationDate(creationDate);

        recipeRepo.save(recipe);

        CollectionRecipe collectionRecipe = new CollectionRecipe();
        collectionRecipe.setRecipe(recipe);
        collectionRecipe.setRecipeCollector(recipeOwner);

        collectionRecipeRepo.save(collectionRecipe);

        System.out.println(creationDate);

        Recipes lastAddedRecipe = getAllRecipes().stream().filter(p -> {
            System.out.println(p.getCreationDate());
            return p.getCreationDate().equals(creationDate);
        }).findFirst().orElse(null);
        if (lastAddedRecipe != null) {
            return new ResponseMessage(lastAddedRecipe.getRecipeId() + " Recipe " + recipe.getRecipeName() + " has been added successfully");
        } else {
            return new ResponseMessage(" Recipe " + recipe + " has not been found");
        }
    }

    @Override
    public ResponseMessage updateRecipe(Long recipeId, RecipeRequest recipeRequest) {

        String recipeName = "";
        Optional<Recipes> recipe = recipeRepo.findById(recipeId);
        if (recipe.isPresent()) {
            Recipes updatedRecipe = recipe.get();

            User currentLoggedUser = userService.findByUsername(userService.getLoggedUser().getUsername());

            if (currentLoggedUser == null) {
                return new ResponseMessage("Current logged user has not been found");
            }

            if (!updatedRecipe.getRecipeOwner().equals(currentLoggedUser)) {
                return new ResponseMessage("Only recipe owner is permitted to update recipe");
            }

            recipeName = recipeRequest.getRecipeName();

            ResponseMessage responseMessage = verify("name", recipeName);
            if (responseMessage.getMessage().equals("Recipe name is valid")) {
                updatedRecipe.setRecipeName(recipeName);
            } else {
                return responseMessage;
            }

            List<String> recipeProducts = recipeRequest.getRecipeProducts();
            List<RecipeProduct> currentRecipeProducts = new ArrayList<>();
            currentRecipeProducts.addAll(updatedRecipe.getRecipeProducts());
            List<RecipeProduct> products = new ArrayList<>();

            ResponseMessage responseMessage4 = verify("recipeProducts", recipeProducts);

            if (!(responseMessage4.getMessage().equals("Recipe products are valid"))) {
                return responseMessage4;
            }

            for (String recipeProductStatement : recipeProducts) {

                ResponseMessage responseMessage5 = verify("recipeProductStatement", recipeProductStatement);

                if (!(responseMessage5.getMessage().equals("Recipe product statement is valid"))) {
                    return responseMessage5;
                }
                String[] parts = recipeProductStatement.split(";");
                String recipeProductName = parts[0];
                Double recipeProductAmount = Double.valueOf(parts[1]);
                String recipeProductUnit = parts[2];

                ResponseMessage responseMessage6 = verify("recipeProductName", recipeProductName);

                if (!(responseMessage6.getMessage().equals("Recipe product name is valid"))) {
                    return responseMessage6;
                }

                ResponseMessage responseMessage7 = verify("recipeProductAmount", recipeProductAmount);

                if (!(responseMessage7.getMessage().equals("Recipe product amount is valid"))) {
                    return responseMessage7;
                }

                ResponseMessage responseMessage8 = verify("recipeProductUnit", recipeProductUnit);

                if (!(responseMessage8.getMessage().equals("Recipe product unit is valid"))) {
                    return responseMessage8;
                }

                Product product = productRepo.findByProductName(recipeProductName);
                RecipeProduct recipeProduct = new RecipeProduct();
                recipeProduct.setProduct(product);
                recipeProduct.setProductAmount(recipeProductAmount);
                recipeProduct.setProductUnit(recipeProductUnit);
                recipeProduct.setRecipe(updatedRecipe);
                products.add(recipeProduct);
            }

            for (RecipeProduct recipeProduct : currentRecipeProducts) {
                System.out.println(recipeProduct.getProduct().getProductName());
                recipeProduct.removeRecipe(updatedRecipe);
                recipeProductsRepo.delete(recipeProduct);
            }

            for (RecipeProduct recipeProduct : products) {
                recipeProductsRepo.save(recipeProduct);
            }

            updatedRecipe.setRecipeProducts(products);

            List<String> recipeSteps = recipeRequest.getRecipeSteps();
            List<RecipeStep> currentSteps = new ArrayList<>();
            currentSteps.addAll(updatedRecipe.getRecipeSteps());
            List<RecipeStep> steps = new ArrayList<>();

            ResponseMessage responseMessage9 = verify("recipeSteps", recipeSteps);

            if (!(responseMessage9.getMessage().equals("Recipe steps are valid"))) {
                return responseMessage9;
            }

            for (String recipeStepStatement : recipeSteps) {

                ResponseMessage responseMessage10 = verify("recipeStepStatement", recipeStepStatement);

                if (!(responseMessage10.getMessage().equals("Recipe step statement is valid"))) {
                    return responseMessage10;
                }
                RecipeStep recipeStep = new RecipeStep();
                recipeStep.setRecipeStepDescription(recipeStepStatement);
                recipeStep.setRecipe(updatedRecipe);
                steps.add(recipeStep);
            }
            for (RecipeStep recipeStep : currentSteps) {
                System.out.println(recipeStep.getRecipeStepDescription());
                recipeStep.removeRecipe(updatedRecipe);
                recipeStepsRepo.delete(recipeStep);
            }

            for (RecipeStep recipeStep : steps) {
                recipeStepsRepo.save(recipeStep);
            }

            updatedRecipe.setRecipeSteps(steps);

            updatedRecipe.setApprovalStatus("pending");
            updatedRecipe.setRejectExplanation(null);
            updatedRecipe.setAssessmentDate(null);

            recipeRepo.save(updatedRecipe);

            return new ResponseMessage("Recipe " + recipeName + " has been updated successfully");
        }
        return new ResponseMessage("Recipe " + recipeName + " has not been found");
    }

    @Override
    public ResponseMessage removeRecipe(Long recipeId) {

        String item_type = "recipe";

        User currentLoggedUser = userService.findByUsername(userService.getLoggedUser().getUsername());
        if (currentLoggedUser == null) {
            return new ResponseMessage("Current logged user has not been found");
        }
        Optional<Recipes> optionalRecipe = recipeRepo.findById(recipeId);
        if (optionalRecipe.isPresent()) {
            Recipes removedRecipe = optionalRecipe.get();

            if (removedRecipe.getRecipeOwner().getUserId().equals(currentLoggedUser.getUserId())) {

                List<CollectionRecipe> collection = new ArrayList<>();
                collectionRecipeRepo.findAll().forEach(collection::add);
                if (!collection.isEmpty()) {
                    for (CollectionRecipe collectionRecipe : collection) {
                        if (collectionRecipe.getRecipe().getRecipeId().equals(removedRecipe.getRecipeId())) {
                            collectionRecipeRepo.delete(collectionRecipe);
                        }
                    }
                }

                imageService.removeImageIfExists(item_type, removedRecipe.getRecipeId());
                recipeRepo.delete(removedRecipe);
                return new ResponseMessage("Recipe " + removedRecipe.getRecipeName() + " has been removed successfully");
            }

            return new ResponseMessage("Only recipe owner can remove recipe");

        }
        return new ResponseMessage("Recipe id " + recipeId + " has not been found");
    }

    @Override
    public List<Recipes> searchRecipes(RecipeSearchRequest recipeSearchRequest) {

        String phrase = recipeSearchRequest.getPhrase();

        List<Recipes> recipes = new ArrayList<>();
        recipes.addAll(getAllRecipes());

        if (!phrase.equals("")) {
            recipes = recipes.stream().filter(recipe -> recipe.getRecipeName().toLowerCase().contains(phrase.toLowerCase())).collect(Collectors.toList());
        }
        return recipes;
    }

    @Override
    public ResponseMessage serveRecipeCustomerSatisfaction(Long recipeId, String type, Float rating) {
        if (recipeId == null) {
            return new ResponseMessage("recipeId cannot be null");
        }
        User currentLoggedUser = userService.findByUsername(userService.getLoggedUser().getUsername());
        if (currentLoggedUser == null) {
            return new ResponseMessage("Current logged user has not been found");
        }
        Recipes recipe = recipeRepo.findByRecipeId(recipeId);
        if (recipe == null) {
            return new ResponseMessage("Recipe marked id " + recipeId + " has not been found");
        } else if (!recipe.getApprovalStatus().equals("accepted")) {
            return new ResponseMessage("Only accepted recipe might be rated and marked as favourite");
        }
        RecipeCustomerSatisfaction recipeCustomerSatisfaction = recipeCustomerSatisfactionsRepo.findByCustomerSatisfactionOwnerAndRecipe(currentLoggedUser, recipe);

        if (recipeCustomerSatisfaction == null) {
            recipeCustomerSatisfaction = new RecipeCustomerSatisfaction(recipe, currentLoggedUser);
        }

        if (type.equals("rating")) {
            recipeCustomerSatisfaction.setRecipeRating(rating);
            recipeCustomerSatisfactionsRepo.save(recipeCustomerSatisfaction);
            return new ResponseMessage("Recipe with id " + recipeId + " has been rated with " + rating + " grade");
        }

        recipeCustomerSatisfaction.setRecipeFavourite(!recipeCustomerSatisfaction.getRecipeFavourite());
        recipeCustomerSatisfactionsRepo.save(recipeCustomerSatisfaction);

        String mark = recipeCustomerSatisfaction.getRecipeFavourite() ? "marked" : "unmarked";

        return new ResponseMessage("Recipe with id " + recipeId + " has been " + mark + " as favourite");
    }

    @Override
    public ResponseMessage assessRecipe(ItemAssessRequest itemAssessRequest) {
        Recipes assessedRecipe = recipeRepo.findById(itemAssessRequest.getItemId()).orElse(null);

        if (assessedRecipe != null) {

            if (!assessedRecipe.getApprovalStatus().equals("pending")) {
                return new ResponseMessage("Recipe has been assessed yet");
            }

            String assessment = itemAssessRequest.getAssessment();
            String rejectExplanation = itemAssessRequest.getRejectExplanation();
            String assessmentDate = new Date().toInstant().toString();
            assessedRecipe.setAssessmentDate(assessmentDate);

            switch (assessment) {
                case "accept":
                    assessedRecipe.setApprovalStatus("accepted");
                    if (rejectExplanation != null) {
                        return new ResponseMessage("Rejection explanation is only required for recipe rejection");
                    }
                    recipeRepo.save(assessedRecipe);
                    return new ResponseMessage("Recipe " + assessedRecipe.getRecipeName() + " has been accepted");
                case "reject":
                    assessedRecipe.setApprovalStatus("rejected");
                    if (rejectExplanation == null || rejectExplanation.equals("")) {
                        return new ResponseMessage("Rejection explanation is required for recipe rejection");
                    }
                    assessedRecipe.setRejectExplanation(rejectExplanation);
                    recipeRepo.save(assessedRecipe);
                    return new ResponseMessage("Recipe " + assessedRecipe.getRecipeName() + " has been rejected");
                default:
                    return new ResponseMessage("Wrong assessment");
            }
        }
        return new ResponseMessage("Proper recipe has not been found");
    }

    @Override
    public List<String> getAllUnits() {
        return recipeProductUnits;
    }

    @Override
    public ResponseMessage shareRecipe(Long recipeId) {
        Recipes sharedRecipe = recipeRepo.findById(recipeId).orElse(null);

        if (sharedRecipe != null) {
            if (sharedRecipe.getApprovalStatus().equals("accepted")) {

                User currentLoggedUser = userService.findByUsername(userService.getLoggedUser().getUsername());
                if (currentLoggedUser == null) {
                    return new ResponseMessage("Current logged user has not been found");
                }

                if (!sharedRecipe.getRecipeOwner().getUserId().equals(currentLoggedUser.getUserId())) {
                    return new ResponseMessage("Only recipe owner can share recipe");
                }

                sharedRecipe.setRecipeShared(!sharedRecipe.getRecipeShared());

                if (!sharedRecipe.getRecipeShared()) {
                    List<CollectionRecipe> collection = new ArrayList<>();
                    collectionRecipeRepo.findAll().forEach(collection::add);
                    if (!collection.isEmpty()) {
                        for (CollectionRecipe collectionRecipe : collection) {
                            if (!collectionRecipe.getRecipeCollector().getUserId().equals(currentLoggedUser.getUserId()) && collectionRecipe.getRecipe().getRecipeId().equals(sharedRecipe.getRecipeId())) {
                                collectionRecipeRepo.delete(collectionRecipe);
                            }
                        }
                    }
                }

                recipeRepo.save(sharedRecipe);

                String share = sharedRecipe.getRecipeShared() ? "shared" : "unshared";

                return new ResponseMessage("Recipe with id " + recipeId + " has been " + share);
            }
            return new ResponseMessage("Only accepted recipe can be shared");
        }

        return new ResponseMessage("Recipe with id " + recipeId + " has not been found");

    }

    @Override
    public ResponseMessage addRecipeToCollection(Long recipeId) {
        String collected = "added to";

        Recipes recipe = recipeRepo.findById(recipeId).orElse(null);

        if (recipe != null) {
            if (recipe.getApprovalStatus().equals("accepted")) {
                if (recipe.getRecipeShared()) {

                    User currentLoggedUser = userService.findByUsername(userService.getLoggedUser().getUsername());
                    if (currentLoggedUser == null) {
                        return new ResponseMessage("Current logged user has not been found");
                    }

                    if (recipe.getRecipeOwner().getUserId().equals(currentLoggedUser.getUserId())) {
                        return new ResponseMessage("Recipe owner cannot add recipe to own collection");
                    }

                    List<CollectionRecipe> collection = collectionRecipeRepo.findByRecipeCollector(currentLoggedUser);
                    if (collection == null) {
                        CollectionRecipe collectionRecipe = new CollectionRecipe();
                        collectionRecipe.setRecipe(recipe);
                        collectionRecipe.setRecipeCollector(currentLoggedUser);
                        collectionRecipeRepo.save(collectionRecipe);
                    } else {
                        collection = collection.stream().filter(collectionRecipe -> collectionRecipe.getRecipe().equals(recipe)).collect(Collectors.toList());
                        if (collection.size() < 1) {
                            CollectionRecipe collectionRecipe = new CollectionRecipe();
                            collectionRecipe.setRecipe(recipe);
                            collectionRecipe.setRecipeCollector(currentLoggedUser);
                            collectionRecipeRepo.save(collectionRecipe);
                        } else {
                            collected = "removed from";
                            collectionRecipeRepo.deleteById(collection.get(0).getId());
                        }
                    }

                    return new ResponseMessage("Recipe with id " + recipeId + " has been " + collected + " collection");
                }
                return new ResponseMessage("Only shared recipe can be added to collection");
            }
            return new ResponseMessage("Only accepted recipe can be added to collection");
        }

        return new ResponseMessage("Recipe with id " + recipeId + " has not been found");
    }

    @Override
    public ResponseMessage checkIfInCollection(Long recipeId) {

//        User currentLoggedUser = userService.findByUsername(userService.getLoggedUser().getUsername());
//        if (currentLoggedUser == null) {
//            return new ResponseMessage("Current logged user has not been found");
//        }
//
//        List<CollectionRecipe> collection = collectionRecipeRepo.findByRecipeCollector(currentLoggedUser);
//
//        if (collection == null) {
//            return new ResponseMessage("Collection recipes has not been found");
//        }
//
//        List<Recipes> recipesCollection = collection.stream().map(CollectionRecipe::getRecipe).collect(Collectors.toList());
//
//        List<Recipes> recipesList = getAllRecipes().stream().filter(recipe -> recipe.getApprovalStatus().equals("accepted") && recipesCollection.contains(recipe)).collect(Collectors.toList());

//        recipesList = recipesList.stream().filter(recipesCollection::contains).collect(Collectors.toList());

        RecipeGetRequest request = new RecipeGetRequest();
        request.setAll("yes");
        request.setGroupNumber(0);
        request.setRecipesGroup("personal");
        request.setPhrase("");

        List<Recipes> recipesList = getRecipes(request);

        Recipes recipe = recipeRepo.findByRecipeId(recipeId);

        if (recipe == null) {
            return new ResponseMessage("Recipe with id " + recipeId + " has not been found");
        }

        if (recipesList.contains(recipe)) {
            return new ResponseMessage("Recipe " + recipe.getRecipeName() + " with id " + recipeId + " is in collection");
        }

        return new ResponseMessage("Recipe " + recipe.getRecipeName() + " with id " + recipeId + " is not in collection");

    }

    @Override
    public List<List<SuitabilityRecipeResponse>> checkRecipeSuitability(Long recipeId) {
        Recipes recipe = recipeRepo.findByRecipeId(recipeId);

        if (recipe == null) {
            return null;
        }

        List<List<SuitabilityRecipeResponse>> list = new ArrayList<>();

        Map<String, List<Double>> nutrientsScopes = new LinkedHashMap<>();
        nutrientsScopes.put("breakfast", List.of(0.25, 0.3));
        nutrientsScopes.put("lunch", List.of(0.05, 0.1));
        nutrientsScopes.put("dinner", List.of(0.35, 0.4));
        nutrientsScopes.put("tea", List.of(0.05, 0.1));
        nutrientsScopes.put("supper1", List.of(0.15, 0.2));
        nutrientsScopes.put("supper2", List.of(0.25, 0.3));

        List<DietaryPreferences> preferences = preferencesService.getUserDietaryPreferences();

        if (preferences == null) {
            return null;
        }

        Map<String, List<Double>> dailyNutrientsScopes;

        String[] keySet = nutrientsScopes.keySet().toArray(new String[0]);

        for (int j = 0; j < preferences.size(); j++) {
            DietaryPreferences preference = preferences.get(j);
            list.add(new ArrayList<>());

            Set<DietaryPreferencesNutrient> nutrients = preference.getNutrients();
            Map<String, Double> totalDailyNutrients = new LinkedHashMap<>();

            for (DietaryPreferencesNutrient dietaryPreferencesNutrient : nutrients) {
                totalDailyNutrients.put(dietaryPreferencesNutrient.getNutrient().getNutrientName(), dietaryPreferencesNutrient.getNutrientAmount());
            }

            for (int i = 0; i < keySet.length; i++) {
                String mealName = keySet[i];
                SuitabilityRecipeResponse suitableRecipe;
                List<Double> scope = nutrientsScopes.get(mealName);

                Double recipeCalories = recipe.getRecipeCalories();
                Double totalDailyCalories = preference.getTotalDailyCalories();

                Double lowerBound = scope.get(0) * totalDailyCalories;
                Double upperBound = scope.get(1) * totalDailyCalories;

                Long tempLowerBound = Math.round(lowerBound * 100);

                lowerBound = Double.valueOf(tempLowerBound) / 100;

                Long tempUpperBound = Math.round(upperBound * 100);

                upperBound = Double.valueOf(tempUpperBound) / 100;

                Long tempRecipeCalories = Math.round(recipeCalories * 100);

                recipeCalories = Double.valueOf(tempRecipeCalories) / 100;

                System.out.println(recipeCalories);

                if (recipeCalories < lowerBound) {
                    System.out.println("lowerBound " + lowerBound);
                    suitableRecipe = new SuitabilityRecipeResponse(false, "Calories " + recipeCalories + " are less than " + lowerBound);

                    if (i == 0)
                        suitableRecipe.setPreferenceCalories(preference.getTotalDailyCalories());

                    list.get(j).add(suitableRecipe);
                    continue;
                } else if (recipeCalories > upperBound) {
                    System.out.println("upperBound " + upperBound);
                    suitableRecipe = new SuitabilityRecipeResponse(false, "Calories " + recipeCalories + " are more than " + upperBound);

                    if (i == 0)
                        suitableRecipe.setPreferenceCalories(preference.getTotalDailyCalories());

                    list.get(j).add(suitableRecipe);
                    continue;
                }

                Double lowerProteinsLimit, upperProteinsLimit, lowerCarbohydratesLimit, upperCarbohydratesLimit, lowerFatsLimit, upperFatsLimit;

                lowerProteinsLimit = scope.get(0) * totalDailyNutrients.get("Protein");
                upperProteinsLimit = scope.get(1) * totalDailyNutrients.get("Protein");

                lowerCarbohydratesLimit = (nutrientsScopes.get(mealName).get(0)) * totalDailyNutrients.get("Carbohydrate");
                upperCarbohydratesLimit = (nutrientsScopes.get(mealName).get(1)) * totalDailyNutrients.get("Carbohydrate");

                lowerFatsLimit = (nutrientsScopes.get(mealName).get(0)) * totalDailyNutrients.get("Fat");
                upperFatsLimit = (nutrientsScopes.get(mealName).get(1)) * totalDailyNutrients.get("Fat");

                dailyNutrientsScopes = new LinkedHashMap<>();
                dailyNutrientsScopes.put("Protein", List.of(lowerProteinsLimit, upperProteinsLimit));
                dailyNutrientsScopes.put("Carbohydrate", List.of(lowerCarbohydratesLimit, upperCarbohydratesLimit));
                dailyNutrientsScopes.put("Fat", List.of(lowerFatsLimit, upperFatsLimit));

                ResponseMessage verifyRecipeMessage = menuService.verifyRecipe(recipe, dailyNutrientsScopes, preference);

                String message = verifyRecipeMessage.getMessage();

                if (message.equals("Recipe is appropriate in regard to dietary preference")) {
                    suitableRecipe = new SuitabilityRecipeResponse(true, "");
                } else {
                    suitableRecipe = new SuitabilityRecipeResponse(false, message);
                }

                if (i == 0)
                    suitableRecipe.setPreferenceCalories(preference.getTotalDailyCalories());

                list.get(j).add(suitableRecipe);

//                switch (verifyRecipeMessage.getMessage()) {
//                    case "Recipe is appropriate in regard to dietary preference":
//                        suitableRecipe = new SuitabilityRecipeResponse(true, "");
//                        list.get(i).add(suitableRecipe);
//                        break;
//                    case "Recipe has inappropriate amount of Protein":
//                        suitableRecipe = new SuitabilityRecipeResponse(false, "Recipe has inappropriate amount of Protein");
//                        list.get(i).add(suitableRecipe);
//                        break;
//                    case "Recipe has inappropriate amount of Carbohydrate":
//                        suitableRecipe = new SuitabilityRecipeResponse(false, "Recipe has inappropriate amount of Carbohydrate");
//                        list.get(i).add(suitableRecipe);
//                        break;
//                    case "Recipe has inappropriate amount of Fat":
//                        suitableRecipe = new SuitabilityRecipeResponse(false, "Recipe has inappropriate amount of Fat");
//                        list.get(i).add(suitableRecipe);
//                        break;
//                    default:
//                        String message = verifyRecipeMessage.getMessage();
//                        if (message.equals("Recipe is inappropriate in regard to dietary preference (Recipe " + recipe.getRecipeName() + " does not belong to user's recipe collection)")) {
//                            suitableRecipe = new SuitabilityRecipeResponse(false, message);
//                            list.get(i).add(suitableRecipe);
//                        } else if (message.startsWith("Recipe " + recipe.getRecipeName() + " contains most products, which belong to category"))
//                        break;
//                }
            }

        }

        return list;
    }

}