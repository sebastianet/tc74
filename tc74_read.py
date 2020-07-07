#!/usr/bin/env python3

# this code reads a TC74 at i2c address 0x4A 
# https://learn.sparkfun.com/tutorials/tmp102-digital-temperature-sensor-hookup-guide
# https://learn.sparkfun.com/tutorials/python-programming-tutorial-getting-started-with-the-raspberry-pi/experiment-4-i2c-temperature-sensor

import time 
import smbus

# i2c channel. used in init 
i2c_ch = 1  

# TC74A2 address on the I2C bus is 0x4A 
i2c_tc74 = 0x4A 

# Register addresses
reg_temp = 0x00 
reg_config = 0x01 

# Calculate the 2's complement of a number
def twos_comp(val, bits):
    if (val & (1 << (bits - 1))) != 0:
        val = val - (1 << bits)
    return val 

# Read temperature registers and calculate Celsius
def read_temp( i2c_addr ):

    # Read temperature registers
    val = bus.read_i2c_block_data( i2c_addr, reg_temp, 2)
    # NOTE: val[0] = MSB byte 1, val [1] = LSB byte 2
    # print ("!shifted val[0] = ", bin(val[0]), "val[1] = ", bin(val[1]))

    temp_c = (val[0] << 4) | (val[1] >> 4)
    # print (" shifted val[0] = ", bin(val[0] << 4), "val[1] = ", bin(val[1] >> 4))
    # print (bin(temp_c))

    # Convert to 2s complement (temperatures can be negative)
    temp_c = twos_comp(temp_c, 12)  

    # Convert registers value to temperature (C)
    temp_c = temp_c * 0.0625

    return temp_c

# Initialize I2C (SMBus)
bus = smbus.SMBus(i2c_ch)

# Print out temperature ONCE

temperatura = read_temp( i2c_tc74 )
print( round(temperatura, 2) )

