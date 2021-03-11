package ro.ase.acs.interfaces;

public interface CarInterface extends VehicleInterface {
    public String getColor();
    public void setColor(String color);
    public int getCapacity();
    public void setCapacity(int capacity);
    public String toString();
}
