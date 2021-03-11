package ro.ase.acs.interfaces;

public interface VehicleInterface {
    public String getName();
    public int getSpeed();
    public Object clone() throws CloneNotSupportedException;
    public abstract void move();
};
