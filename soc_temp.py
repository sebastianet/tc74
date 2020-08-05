#!/usr/bin/env python

# https://raspberrypi.stackexchange.com/questions/85415/how-to-directly-get-cpu-temp-in-python
# https://gpiozero.readthedocs.io/en/stable/

import datetime
import time 

import platform    
import sys

from gpiozero import CPUTemperature
import vcgencmd
from vcgencmd import Vcgencmd

vcgm = Vcgencmd()

print( platform.python_version() )
print( "Python version", sys.version )
print( "vcgm version ", vcgm.version() )

CPUc = vcgm.measure_temp()
print( "vcgm ", CPUc)

cpu = CPUTemperature()
print( "gpio ", cpu.temperature)

sys.exit()
