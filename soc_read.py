#!/usr/bin/env python

import sys

from gpiozero import CPUTemperature

cpu = CPUTemperature()
print cpu.temperature

