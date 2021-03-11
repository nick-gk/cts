package ro.ase.acs.classes;

import ro.ase.acs.interfaces.VehicleInterface;

public abstract class Vehicle implements VehicleInterface, Cloneable {
    private String name;
    private int speed;

    public Vehicle() {
        name = "";
        speed = 1;
    }

    public Vehicle(String name, int speed) {
        this.name = name;
        this.speed = speed;
    }

    public String getName() {
        return name;
    }

    public int getSpeed() {
        return speed;
    }

    @Override
    public Object clone() throws CloneNotSupportedException {
        Vehicle copy = (Vehicle)super.clone();
        copy.name = name;
        copy.speed = speed;
        return copy;
    }

    public abstract void move();
}