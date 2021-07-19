package agh.edu.pl.diet.entities;

import org.hibernate.annotations.Cascade;

import javax.persistence.*;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long productId;
    private String productName;
    private Integer calories;
    //	private String publicationDate;
    @ManyToOne
    private User owner;
    @ManyToOne
    private Category category;

    @OneToMany(mappedBy = "product", cascade = {CascadeType.REMOVE, CascadeType.PERSIST})
    @Cascade({org.hibernate.annotations.CascadeType.SAVE_UPDATE})
    private Set<ProductNutrient> nutrients = new HashSet<>();

    private String approvalStatus = "pending";
    private Date creationDate = null;
    private Boolean productFavourite = false;

//	@Column(columnDefinition="text")
//	private String description;
//	private int inStockNumber;

    @Transient
    private String productImage;


//	@OneToMany(mappedBy = "product")
//	@JsonIgnore
//	private List<BookToCartItem> bookToCartItemList;


    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getCalories() {
        return calories;
    }

    public void setCalories(Integer calories) {
        this.calories = calories;
    }

//	public String getPublicationDate() {
//		return publicationDate;
//	}
//
//	public void setPublicationDate(String publicationDate) {
//		this.publicationDate = publicationDate;
//	}
//
//	public String getLanguage() {
//		return language;
//	}
//
//	public void setLanguage(String language) {
//		this.language = language;
//	}

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }


//	public int getInStockNumber() {
//		return inStockNumber;
//	}
//
//	public void setInStockNumber(int inStockNumber) {
//		this.inStockNumber = inStockNumber;
//	}

    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }

//	public List<BookToCartItem> getBookToCartItemList() {
//		return bookToCartItemList;
//	}
//
//	public void setBookToCartItemList(List<BookToCartItem> bookToCartItemList) {
//		this.bookToCartItemList = bookToCartItemList;
//	}

    public Set<ProductNutrient> getNutrients() {
        return nutrients;
    }

    public void setNutrients(Set<ProductNutrient> nutrients) {
        this.nutrients = nutrients;
    }

    public void addNutrient(ProductNutrient productNutrient) {
        nutrients.add(productNutrient);
    }

    public String isApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public Boolean getProductFavourite() {
        return productFavourite;
    }

    public void setProductFavourite(Boolean productFavourite) {
        this.productFavourite = productFavourite;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }
}