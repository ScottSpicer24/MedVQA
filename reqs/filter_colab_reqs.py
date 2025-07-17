requirements_before_installs = 'colab_base.txt'
requirements_after_installs = 'colab_final.txt'

'''
# filter out packages from junk 
'''
with open(requirements_before_installs, 'r') as f:
  junk = f.readlines()

with open(requirements_after_installs, 'r') as f:
  packages_plus_junk = f.readlines()

packages = [package for package in packages_plus_junk if package not in junk]

''' 
# save clean file
'''
with open('requirements.txt', 'w') as f:
  f.writelines(packages)