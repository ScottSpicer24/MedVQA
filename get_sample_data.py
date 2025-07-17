import csv
import os

path = "PMC-VQA/test_2.csv"

with open(path) as file:
    reader = csv.reader(file)
    for file in os.walk("PMC-VQA/images_2"):
        print("TODO")




