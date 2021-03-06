package agh.edu.pl.diet.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cascade;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "Dietary_preferences_recipe")
public class DietaryPreferencesRecipe {
    @JsonIgnore
    @Id
    @Column(name = "dietary_preferences_recipe_id")
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @Cascade({org.hibernate.annotations.CascadeType.SAVE_UPDATE})
    @JoinColumn(name="dietary_preferences_id", nullable=false)
    private DietaryPreferences dietaryPreferences;

    @ManyToOne(cascade = CascadeType.PERSIST)
    @Cascade({org.hibernate.annotations.CascadeType.SAVE_UPDATE})
    @JoinColumn(name="recipe_id", nullable=false)
    private Recipes recipe;

    @NotNull
    private boolean recipePreferred;

    public DietaryPreferencesRecipe() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DietaryPreferences getDietaryPreferences() {
        return dietaryPreferences;
    }

    public void setDietaryPreferences(DietaryPreferences dietaryPreferences) {
        this.dietaryPreferences = dietaryPreferences;
    }

    public void removeDietaryPreference() {
        this.dietaryPreferences.removeRecipe(this);
        this.dietaryPreferences = null;
    }

    public Recipes getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipes recipe) {
        this.recipe = recipe;
    }

    public boolean isRecipePreferred() {
        return recipePreferred;
    }

    public void setRecipePreferred(boolean recipePreferred) {
        this.recipePreferred = recipePreferred;
    }
}
