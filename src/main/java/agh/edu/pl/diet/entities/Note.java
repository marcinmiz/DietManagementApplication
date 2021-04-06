package agh.edu.pl.diet.entities;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Objects;

@Entity
@Table(name = "product")
public class Note
{
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@NotNull
	private String title;

	@NotNull
	private String product;

	@NotNull
	private String note;

	@NotNull
	private Long userId;

	public Long getId()
	{
		return id;
	}

	public void setId(Long id)
	{
		this.id = id;
	}

	public String getTitle()
	{
		return title;
	}

	public void setTitle(String title)
	{
		this.title = title;
	}

	public String getProduct()
	{
		return product;
	}

	public void setProduct(String product)
	{
		this.product = product;
	}

	public String getNote()
	{
		return note;
	}

	public void setNote(String note)
	{
		this.note = note;
	}

	public Long getUserId()
	{
		return userId;
	}

	public void setUserId(Long userId)
	{
		this.userId = userId;
	}

	@Override
	public String toString()
	{
		return "Note{" +
				"id=" + id +
				", title='" + title + '\'' +
				", product='" + product + '\'' +
				", note='" + note + '\'' +
				", userId=" + userId +
				'}';
	}

	@Override
	public boolean equals(Object o)
	{
		if(this == o) return true;
		if(o == null || getClass() != o.getClass()) return false;
		Note note1 = (Note) o;
		return Objects.equals(getId(), note1.getId()) &&
				Objects.equals(getTitle(), note1.getTitle()) &&
				Objects.equals(getProduct(), note1.getProduct()) &&
				Objects.equals(getNote(), note1.getNote()) &&
				Objects.equals(getUserId(), note1.getUserId());
	}

	@Override
	public int hashCode()
	{
		return Objects.hash(getId(), getTitle(), getProduct(), getNote(), getUserId());
	}
}
