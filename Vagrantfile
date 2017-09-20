# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.network "forwarded_port", guest: 22, host: 1234
  config.vm.network "forwarded_port", guest: 80, host: 80
  config.vm.network "forwarded_port", guest: 8080, host: 9999

  config.vm.network :private_network, ip: "192.168.68.8"

  config.vm.provider "virtualbox" do |vb|
      vb.memory = "2048"
  end
end
