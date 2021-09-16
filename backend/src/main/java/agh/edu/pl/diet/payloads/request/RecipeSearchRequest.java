package agh.edu.pl.diet.payloads.request;

import javax.validation.constraints.NotBlank;

public class RecipeSearchRequest {

    @NotBlank
    private String phrase;

    public String getPhrase() {
        return phrase;
    }

    public void setPhrase(String phrase) {
        this.phrase = phrase;
    }

}
