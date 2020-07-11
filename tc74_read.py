#!/usr/bin/env python

# pip3.7 install smbus2

import time 
from smbus2 import SMBus
import datetime

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

# Initialize I2C (SMBus)
bus = SMBus( i2c_ch )

# Print out temperature ONCE

b = bus.read_byte_data( i2c_tc74, 0)     # read one byte from xip, offset 0
c = twos_comp( b, 8 )

print( c )

